/**
 * StageScene.jsx
 * 3D 舞台场景 - 使用 Three.js 展示所有 Agent 的工作状态
 * @author 小软 🤖
 * @version 1.0.0
 */

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

/**
 * AgentAvatar - 3D Agent 头像组件
 * @param {Object} position - 3D 位置 [x, y, z]
 * @param {Object} agent - Agent 数据 {name, status, color}
 * @param {Function} onClick - 点击回调
 */
function AgentAvatar({ position, agent, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // 每帧旋转动画
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  // 根据状态确定颜色
  const getStatusColor = (status) => {
    switch (status) {
      case 'working': return '#4CAF50'; // 绿色 - 工作中
      case 'idle': return '#FFC107';    // 黄色 - 空闲
      case 'error': return '#F44336';   // 红色 - 错误
      default: return '#2196F3';        // 蓝色 - 默认
    }
  };

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
        {/* Agent 头像球体 */}
        <mesh
          ref={meshRef}
          position={[0, 1.5, 0]}
          scale={hovered ? 1.2 : 1}
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial
            color={getStatusColor(agent.status)}
            emissive={getStatusColor(agent.status)}
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Agent 名称标签 */}
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {agent.name}
        </Text>

        {/* 状态标签 */}
        <Text
          position={[0, 2.1, 0]}
          fontSize={0.2}
          color={getStatusColor(agent.status)}
          anchorX="center"
          anchorY="middle"
        >
          {agent.statusText || '工作中'}
        </Text>

        {/* 底座 */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.8, 1, 0.1, 32]} />
          <meshStandardMaterial color="#333" />
        </mesh>

        {/* 光晕效果 */}
        <pointLight
          position={[0, 1.5, 0]}
          color={getStatusColor(agent.status)}
          intensity={1}
          distance={3}
        />
      </Float>
    </group>
  );
}

/**
 * StagePlatform - 舞台平台
 */
function StagePlatform() {
  return (
    <group>
      {/* 主舞台 */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[8, 10, 0.2, 64]} />
        <meshStandardMaterial
          color="#1a1a2e"
          emissive="#16213e"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* 装饰环 */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7, 7.5, 64]} />
        <meshStandardMaterial
          color="#0f3460"
          emissive="#0f3460"
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

/**
 * StageScene - 主场景组件
 * @param {Array} agents - Agent 列表数据
 * @param {Function} onAgentClick - Agent 点击回调
 */
export default function StageScene({ agents = [], onAgentClick }) {
  return (
    <Canvas
      camera={{ position: [0, 5, 12], fov: 60 }}
      style={{ background: 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)' }}
    >
      {/* 环境光 */}
      <ambientLight intensity={0.5} />
      
      {/* 主光源 */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
      />

      {/* 点光源 - 舞台效果 */}
      <pointLight position={[0, 5, 0]} intensity={2} color="#ffffff" />
      <pointLight position={[-5, 3, 5]} intensity={1} color="#4CAF50" />
      <pointLight position={[5, 3, -5]} intensity={1} color="#2196F3" />

      {/* 星空背景 */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* 舞台平台 */}
      <StagePlatform />

      {/* Agent 展示 */}
      {agents.map((agent, index) => {
        // 圆形排列 Agent
        const angle = (index / agents.length) * Math.PI * 2;
        const radius = 4;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <AgentAvatar
            key={agent.id}
            position={[x, 0, z]}
            agent={agent}
            onClick={() => onAgentClick && onAgentClick(agent)}
          />
        );
      })}

      {/* 轨道控制器 */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={8}
        maxDistance={20}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
      />
    </Canvas>
  );
}
