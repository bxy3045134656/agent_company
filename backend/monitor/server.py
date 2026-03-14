# -*- coding: utf-8 -*-
"""
OpenClaw Monitor Server - Bai Xiaobai
Get Aliyun Bailian real-time usage data
"""

from flask import Flask, jsonify, request
import requests
import json
from datetime import datetime, timedelta
import os

app = Flask(__name__)

# 配置
API_KEY = "sk-07cf0b11163c44c18113995e891b182b"
REGION = "cn-beijing"

# 缓存数据
cached_data = {
    "inputTokens": 0,
    "outputTokens": 0,
    "successRequests": 0,
    "remainingRequests": 0,
    "totalQuota": 0,
    "estimatedCost": 0,
    "quotaType": "monthly",  # hourly/weekly/monthly
    "resetTime": None,
    "lastUpdate": None
}

def get_bailian_usage():
    """
    Get Aliyun Bailian usage data
    API Docs: https://help.aliyun.com/zh/dashscope/developer-reference/
    
    Note: Adjust API endpoint and parsing logic based on actual response
    """
    try:
        # Try to get usage data from Aliyun Bailian API
        # This is a sample implementation - adjust based on actual API
        
        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Get current usage statistics
        url = "https://dashscope.aliyuncs.com/api/v1/usage"
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return parse_bailian_response(data)
        else:
            print(f"API request failed: {response.status_code}")
            print(response.text)
            return None
            
    except Exception as e:
        print(f"Error getting data: {e}")
        return None

def parse_bailian_response(data):
    """
    Parse Aliyun Bailian API response
    
    Expected response structure (adjust based on actual API):
    {
        "data": {
            "input_tokens": 76000,
            "output_tokens": 779,
            "total_requests": 156,
            "quota": {
                "total": 1000,
                "used": 156,
                "remaining": 844,
                "type": "monthly",
                "reset_time": "2026-04-01T00:00:00Z"
            },
            "cost": 1.25
        }
    }
    """
    try:
        usage = data.get("data", {})
        quota = usage.get("quota", {})
        
        result = {
            "inputTokens": usage.get("input_tokens", 0),
            "outputTokens": usage.get("output_tokens", 0),
            "successRequests": usage.get("total_requests", 0),
            "remainingRequests": quota.get("remaining", 0),
            "totalQuota": quota.get("total", 0),
            "estimatedCost": usage.get("cost", 0),
            "quotaType": quota.get("type", "monthly"),
            "resetTime": quota.get("reset_time")
        }
        
        return result
    except Exception as e:
        print(f"Error parsing data: {e}")
        return None

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get monitoring data"""
    global cached_data
    
    # Try to get fresh data
    fresh_data = get_bailian_usage()
    
    if fresh_data:
        cached_data = fresh_data
        cached_data["lastUpdate"] = datetime.now().isoformat()
    else:
        # Return cached data if API fails
        cached_data["lastUpdate"] = datetime.now().isoformat()
    
    return jsonify({
        "success": True,
        "data": cached_data
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check"""
    return jsonify({
        "success": True,
        "status": "online",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/refresh', methods=['POST'])
def refresh_data():
    """Manually refresh data"""
    global cached_data
    
    fresh_data = get_bailian_usage()
    
    if fresh_data:
        cached_data = fresh_data
        cached_data["lastUpdate"] = datetime.now().isoformat()
        return jsonify({
            "success": True,
            "message": "Data refreshed successfully",
            "data": cached_data
        })
    else:
        return jsonify({
            "success": False,
            "message": "Failed to get data, returning cached data",
            "data": cached_data
        }), 200

if __name__ == "__main__":
    print("=" * 50)
    print("OpenClaw Monitor Server - Bai Xiaobai")
    print("=" * 50)
    print("Server: http://localhost:5000")
    print("Stats API: http://localhost:5000/api/stats")
    print("Health: http://localhost:5000/api/health")
    print("=" * 50)
    print("Service started. Press Ctrl+C to stop.")
    print()
    
    app.run(host="0.0.0.0", port=5000, debug=False)
