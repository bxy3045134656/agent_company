/**
 * StageScene.jsx
 * 3D 舞台场景 - 使用 Three.js 展示所有 Agent 的工作状态
 * @author 小软 🤖
 * @version 1.0.0
 */

// 临时禁用 3D 依赖，使用简单 2D 展示
// import React, { useRef, useState } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { OrbitControls, Text, Float, Stars } from '@react-three/drei';
// import * as THREE from 'three';

import React from 'react';

/**
 * AgentAvatar - 2D Agent 头像组件（临时版本）
 */
function AgentAvatar({ agent }) {
  const statusColors = {
    active: '#52c41a',
    busy: '#1890ff',
    rest: '#faad14',
    offline: '#d9d9d9',
  };

  const statusText = {
    active: '工作中',
    busy: '忙碌',
    rest: '休息',
    offline: '离线',
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      background: '#f5f5f5',
      borderRadius: '8px',
      margin: '10px',
      minWidth: '150px',
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: statusColors[agent.status] || '#d9d9d9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        marginBottom: '10px',
      }}>
        {agent.emoji || '🤖'}
      </div>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{agent.displayName}</div>
      <div style={{ 
        fontSize: '12px', 
        color: statusColors[agent.status] || '#999',
        background: statusColors[agent.status] || '#d9d9d9',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '10px',
      }}>
        {statusText[agent.status] || '未知'}
      </div>
    </div>
  );
}

/**
 * StageScene - 2D 舞台场景（临时版本）
 */
function StageScene({ agents = [] }) {
  if (!agents || agents.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        color: '#999'
      }}>
        暂无 Agent 数据
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px',
      minHeight: '400px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
    }}>
      {agents.map((agent, index) => (
        <AgentAvatar key={agent.id || index} agent={agent} />
      ))}
    </div>
  );
}

export default StageScene;
