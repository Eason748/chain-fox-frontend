import * as THREE from 'three';

// Initialize Three.js scene with network particles effect
export function initNetworkParticles() {
  // Check if already initialized
  if (document.getElementById('network-particles-container')) {
    return;
  }

  // 检测设备性能
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isLowPerformance = isMobile || window.innerWidth < 768;
  const isMediumPerformance = !isLowPerformance && window.innerWidth < 1200;

  // 根据性能级别设置质量
  const qualityLevel = isLowPerformance ? 'low' : (isMediumPerformance ? 'medium' : 'high');
  // 移除生产环境日志 - 网络粒子质量模式

  // Create container
  const container = document.createElement('div');
  container.id = 'network-particles-container';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.zIndex = '0'; // Keep behind content but above solid background
  container.style.pointerEvents = 'none';
  container.style.opacity = '0.5'; // Set overall opacity for the container
  document.body.appendChild(container);

  // Scene setup
  const scene = new THREE.Scene();

  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.z = 500;

  // Renderer setup - 根据性能级别调整设置
  const renderer = new THREE.WebGLRenderer({
    antialias: !isLowPerformance, // 低性能设备禁用抗锯齿
    alpha: true,
    powerPreference: 'high-performance' // 优先使用高性能GPU
  });

  // 设置渲染尺寸 - 低性能设备降低分辨率
  const pixelRatio = isLowPerformance ? Math.min(1.0, window.devicePixelRatio) :
                    (isMediumPerformance ? Math.min(1.5, window.devicePixelRatio) :
                    window.devicePixelRatio);

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0.3); // 70% transparency (1-0.7)
  renderer.setPixelRatio(pixelRatio);

  // 优化渲染器性能
  renderer.shadowMap.enabled = false; // 禁用阴影

  // 延迟加载 - 使用 requestIdleCallback 在浏览器空闲时初始化
  const startRendering = () => {
    // Add renderer to DOM
    container.appendChild(renderer.domElement);
  };

  // 使用 requestIdleCallback 或 setTimeout 作为降级方案
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(startRendering, { timeout: 1000 });
  } else {
    setTimeout(startRendering, 100);
  }

  // 根据性能级别调整粒子数量和复杂度
  // 低性能设备大幅减少粒子数量和墙体数量
  const wallCount = isLowPerformance ? 2 : (isMediumPerformance ? 4 : 6);
  const wallGridSize = isLowPerformance ? 2 : (isMediumPerformance ? 3 : 4);
  const spacing = isLowPerformance ? 60 : (isMediumPerformance ? 50 : 40); // 低性能设备增加间距
  const particles = [];

  // 跟踪上一帧时间，用于平滑动画
  let lastFrameTime = 0;

  // Wall positions in 3D space
  const wallPositions = [
    {x: -200, y: 0, z: 0, rotY: 0},
    {x: 200, y: 0, z: 0, rotY: Math.PI},
    {x: 0, y: -150, z: 0, rotY: Math.PI/2},
    {x: 0, y: 150, z: 0, rotY: -Math.PI/2},
    {x: 0, y: 0, z: -200, rotY: 0},
    {x: 0, y: 0, z: 200, rotY: Math.PI}
  ];

  // 根据性能级别调整几何体细节
  // 低性能设备使用低多边形几何体
  const sphereSegments = isLowPerformance ? 8 : (isMediumPerformance ? 12 : 16);
  const blockGeometry = new THREE.SphereGeometry(1.2, sphereSegments, sphereSegments);

  // 共享几何体实例 - 提高性能
  const sharedGeometry = blockGeometry;

  // Node colors - blue/purple gradient
  const blockColors = [
    0x1a237e, 0x283593, 0x4527a0,
    0x5e35b1, 0x7e57c2, 0x9575cd,
    0xb39ddb, 0xd1c4e9, 0xede7f6
  ];

  // 根据性能级别选择材质类型
  const createMaterial = (color) => {
    if (isLowPerformance) {
      // 低性能设备使用基础材质
      return new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.65,
        // 禁用不必要的功能
        fog: false,
        lights: false
      });
    } else {
      // 中高性能设备使用标准材质
      return new THREE.MeshStandardMaterial({
        color: color,
        emissive: 0x1a237e,
        emissiveIntensity: 0.2,
        roughness: 0.7,
        metalness: 0.3,
        transparent: true,
        opacity: 0.65,
        // 禁用不必要的功能
        flatShading: isMediumPerformance
      });
    }
  };

  // 创建材质池 - 减少材质数量
  const blockMaterials = blockColors.map(createMaterial);

  // 根据性能级别决定是否使用发光效果
  const useGlowEffect = !isLowPerformance;

  // Create glow material for nodes - 只在中高性能设备上使用
  const glowMaterial = useGlowEffect ? new THREE.MeshBasicMaterial({
    color: 0x7c4dff,
    transparent: true,
    opacity: isMediumPerformance ? 0.15 : 0.2, // 中等性能设备降低透明度
    side: THREE.BackSide,
    // 禁用不必要的功能
    fog: false,
    lights: false
  }) : null;

  // Create multiple walls
  for (let wallIdx = 0; wallIdx < wallCount; wallIdx++) {
    const wallPos = wallPositions[wallIdx];

    for (let x = 0; x < wallGridSize; x++) {
      for (let y = 0; y < wallGridSize; y++) {
        // Create cube vertices (8 blocks per grid point)
        const cubeVertices = [
          {x: -0.5, y: -0.5, z: -0.5},
          {x: 0.5, y: -0.5, z: -0.5},
          {x: -0.5, y: 0.5, z: -0.5},
          {x: 0.5, y: 0.5, z: -0.5},
          {x: -0.5, y: -0.5, z: 0.5},
          {x: 0.5, y: -0.5, z: 0.5},
          {x: -0.5, y: 0.5, z: 0.5},
          {x: 0.5, y: 0.5, z: 0.5}
        ];

        const materialIdx = Math.floor((x + y) / wallGridSize * blockMaterials.length);

        // 低性能设备跳过一些顶点以减少粒子数量
        const skipRate = isLowPerformance ? 2 : (isMediumPerformance ? 1 : 0);
        let vertexCount = 0;

        cubeVertices.forEach(vertex => {
          // 低性能设备跳过一些顶点
          vertexCount++;
          if (skipRate > 0 && vertexCount % (skipRate + 1) !== 0) {
            return;
          }

          const block = new THREE.Mesh(sharedGeometry, blockMaterials[materialIdx]);

          // Position blocks to form cube vertices
          const localX = (x - wallGridSize/2) * spacing + vertex.x * spacing * 0.6;
          const localY = (y - wallGridSize/2) * spacing + vertex.y * spacing * 0.6;
          const localZ = vertex.z * spacing * 0.6;

          // Apply wall position and rotation
          block.position.x = wallPos.x + localX * Math.cos(wallPos.rotY) + localZ * Math.sin(wallPos.rotY);
          block.position.y = wallPos.y + localY;
          block.position.z = wallPos.z + localZ * Math.cos(wallPos.rotY) - localX * Math.sin(wallPos.rotY);

          // Scale blocks
          const size = isLowPerformance ? 2.0 : (isMediumPerformance ? 1.8 : 1.5); // 低性能设备增大粒子尺寸
          block.scale.set(size, size, size);

          // 只在中高性能设备上添加发光效果
          if (useGlowEffect) {
            // 使用共享几何体创建发光效果
            const glowGeometry = isLowPerformance ? null :
                               (isMediumPerformance ?
                                 new THREE.SphereGeometry(1.5, 8, 8) : // 中等性能设备使用低多边形发光球体
                                 new THREE.SphereGeometry(1.5, 12, 12)); // 高性能设备使用中等多边形发光球体

            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.scale.set(size * 1.5, size * 1.5, size * 1.5);
            block.add(glow);
          }

          // 优化动画数据 - 减少随机性和计算量
          block.userData = {
            pulseSpeed: isLowPerformance ? 0.01 : (isMediumPerformance ? 0.015 : 0.02 + Math.random() * 0.01),
            pulsePhase: Math.random() * Math.PI * 2,
            wallId: wallIdx,
            // 添加动画优化标志
            skipAnimation: isLowPerformance && Math.random() > 0.5 // 低性能设备随机跳过一些粒子的动画
          };

          // Add to scene
          scene.add(block);
          particles.push(block);
        });
      }
    }
  }

  // 根据性能级别优化连接线
  const connectionsMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: isLowPerformance ? 0.3 : (isMediumPerformance ? 0.35 : 0.4), // 低性能设备降低透明度
    blending: isLowPerformance ? THREE.NormalBlending : THREE.AdditiveBlending, // 低性能设备禁用叠加混合
    linewidth: isLowPerformance ? 1.0 : (isMediumPerformance ? 1.2 : 1.5) // 低性能设备减小线宽
  });

  // Lines will be updated dynamically
  const linesGeometry = new THREE.BufferGeometry();
  const lines = new THREE.LineSegments(linesGeometry, connectionsMaterial);
  scene.add(lines);

  // 连接线更新频率控制
  let lineUpdateCounter = 0;
  const lineUpdateFrequency = isLowPerformance ? 3 : (isMediumPerformance ? 2 : 1); // 低性能设备降低更新频率

  // 根据性能级别优化光照
  // 低性能设备只使用环境光
  const ambientLight = new THREE.AmbientLight(0x404040, isLowPerformance ? 1.2 : 1.0);
  scene.add(ambientLight);

  // 中高性能设备添加点光源
  let pointLight = null;
  if (!isLowPerformance) {
    pointLight = new THREE.PointLight(0x4facfe, 1, 1000);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);
  }

  // 鼠标交互 - 低性能设备降低交互复杂度
  const mouse = new THREE.Vector2();
  const mouseParticle = new THREE.Vector3();
  let mouseOver = false;

  // 节流函数 - 限制鼠标事件处理频率
  const throttle = (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // 根据性能级别设置节流延迟
  const mouseMoveDelay = isLowPerformance ? 100 : (isMediumPerformance ? 50 : 16);

  // 使用节流函数处理鼠标移动事件
  const handleMouseMove = throttle((event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Convert mouse position to 3D space
    mouseParticle.set(mouse.x * 500, mouse.y * 300, 0);
    mouseOver = true;
  }, mouseMoveDelay);

  // 低性能设备可能完全禁用鼠标交互
  if (!isLowPerformance || !isMobile) {
    container.addEventListener('mousemove', handleMouseMove);

    container.addEventListener('mouseout', () => {
      mouseOver = false;
    });
  }

  // 使用 requestAnimationFrame 的时间戳进行平滑动画
  function animate(timestamp) {
    requestAnimationFrame(animate);

    // 计算帧间隔时间，用于平滑动画
    if (!lastFrameTime) lastFrameTime = timestamp;
    const deltaTime = (timestamp - lastFrameTime) * 0.001; // 转换为秒
    lastFrameTime = timestamp;

    // 限制最大帧间隔时间，防止大延迟导致动画跳跃
    const smoothDelta = Math.min(deltaTime, 0.1);

    // 使用平滑的时间增量
    const time = timestamp * 0.001; // 当前时间（秒）

    // 根据性能级别优化粒子更新
    // 低性能设备可能跳过一些粒子的更新
    const particleUpdateFrequency = isLowPerformance ? 2 : 1; // 低性能设备每2帧更新一次

    if (timestamp % particleUpdateFrequency === 0) {
      // 更新粒子
      particles.forEach(particle => {
        // 跳过标记为不需要动画的粒子
        if (particle.userData.skipAnimation) return;

        // 使用平滑的时间增量计算脉冲效果
        const pulseAmount = Math.sin(time * particle.userData.pulseSpeed + particle.userData.pulsePhase) * 0.1 + 1;
        particle.scale.set(
          pulseAmount, pulseAmount, pulseAmount
        );

        // 只在中高性能设备上更新发光效果
        if (useGlowEffect && particle.children.length > 0) {
          const glow = particle.children[0];
          glow.material.opacity = 0.3 + Math.sin(time * 3 + particle.userData.pulsePhase) * 0.1;
        }
      });
    }

    // 根据设定的频率更新连接线
    lineUpdateCounter++;
    if (lineUpdateCounter >= lineUpdateFrequency) {
      updateConnections(time);
      lineUpdateCounter = 0;
    }

    // 只在中高性能设备上更新点光源
    if (pointLight) {
      pointLight.intensity = 1 + Math.sin(time) * 0.3;
      // 低性能设备减少颜色变化频率
      if (!isMediumPerformance || Math.floor(time) % 2 === 0) {
        pointLight.color.setHSL((time * (isMediumPerformance ? 0.03 : 0.05)) % 1, 0.7, 0.5);
      }
    }

    // 降低旋转速度，减少计算量
    const rotationSpeed = isLowPerformance ? 0.03 : (isMediumPerformance ? 0.05 : 0.1);
    scene.rotation.y = time * rotationSpeed;

    // 固定相机位置，减少计算
    if (timestamp % 10 === 0) { // 降低相机更新频率
      camera.position.set(0, 0, 600);
      camera.lookAt(scene.position);
    }

    // 渲染场景
    renderer.render(scene, camera);
  }

  // 优化连接线更新函数
  function updateConnections(time) {
    const positions = [];
    const colors = [];

    // 根据性能级别调整连接线复杂度
    const blocksPerWall = wallGridSize * wallGridSize * 8;
    const curveSegments = isLowPerformance ? 3 : (isMediumPerformance ? 4 : 5); // 低性能设备减少曲线分段
    const skipConnections = isLowPerformance ? 3 : (isMediumPerformance ? 2 : 1); // 低性能设备跳过一些连接

    // 优化曲线创建函数
    const createCurve = (p1, p2, color1, color2, strength) => {
      // 低性能设备使用直线代替曲线
      if (isLowPerformance) {
        positions.push(p1.x, p1.y, p1.z);
        positions.push(p2.x, p2.y, p2.z);

        colors.push(color1.r, color1.g, color1.b);
        colors.push(color2.r, color2.g, color2.b);
        return;
      }

      // 中高性能设备使用曲线
      const midPoint = new THREE.Vector3(
        (p1.x + p2.x) / 2 + (Math.random() - 0.5) * (isMediumPerformance ? 0.5 : 1),
        (p1.y + p2.y) / 2 + (Math.random() - 0.5) * (isMediumPerformance ? 0.5 : 1),
        (p1.z + p2.z) / 2 + (Math.random() - 0.5) * (isMediumPerformance ? 0.5 : 1)
      );

      const curve = new THREE.CatmullRomCurve3([
        p1.clone(),
        midPoint,
        p2.clone()
      ]);

      const points = curve.getPoints(curveSegments);
      for (let i = 0; i < points.length - 1; i++) {
        positions.push(points[i].x, points[i].y, points[i].z);
        positions.push(points[i+1].x, points[i+1].y, points[i+1].z);

        const fade = i / points.length;
        const r = color1.r * (1-fade) + color2.r * fade;
        const g = color1.g * (1-fade) + color2.g * fade;
        const b = color1.b * (1-fade) + color2.b * fade;

        colors.push(r, g, b);
        colors.push(r, g, b);
      }
    };

    // 连接墙内的块 - 根据性能级别减少连接数量
    for (let wallIdx = 0; wallIdx < wallCount; wallIdx++) {
      const wallStart = wallIdx * blocksPerWall;

      // 低性能设备跳过一些连接
      for (let i = wallStart; i < wallStart + blocksPerWall; i += 8 * skipConnections) {
        // 根据性能级别减少边数
        const cubeEdges = isLowPerformance ?
          // 低性能设备只连接4条边
          [[0, 1], [1, 3], [3, 2], [2, 0]] :
          isMediumPerformance ?
          // 中等性能设备连接8条边
          [[0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4]] :
          // 高性能设备连接所有12条边
          [
            // Bottom face edges
            [0, 1], [1, 3], [3, 2], [2, 0],
            // Top face edges
            [4, 5], [5, 7], [7, 6], [6, 4],
            // Vertical edges
            [0, 4], [1, 5], [2, 6], [3, 7]
          ];

        cubeEdges.forEach(edge => {
          const idx1 = i + edge[0];
          const idx2 = i + edge[1];
          if (idx2 < particles.length) {
            createCurve(
              particles[idx1].position,
              particles[idx2].position,
              particles[idx1].material.color,
              particles[idx2].material.color,
              0.7 + Math.sin(time * 0.3 + i * 0.03) * 0.01
            );
          }
        });
      }
    }

    // 连接墙之间的块 - 低性能设备可能完全跳过
    if (!isLowPerformance) {
      // 减少连接数量
      const wallConnectionFrequency = isMediumPerformance ? 15 : 9;

      for (let i = 0; i < particles.length; i += wallConnectionFrequency) {
        if (particles[i].userData.wallId % 2 === 0) {
          const targetWall = (particles[i].userData.wallId + 1) % wallCount;
          const targetIdx = Math.floor(i / blocksPerWall) * blocksPerWall +
                          (i % (wallGridSize * wallGridSize * 8)) +
                          targetWall * blocksPerWall;

          if (targetIdx < particles.length) {
            createCurve(
              particles[i].position,
              particles[targetIdx].position,
              particles[i].material.color,
              particles[targetIdx].material.color,
              0.4 + Math.sin(time * 0.5 + i * 0.03) * 0.005
            );
          }
        }
      }
    }

    // 鼠标交互连接 - 低性能设备减少连接数量
    if (mouseOver) {
      // 设置最大连接数
      const maxMouseConnections = isLowPerformance ? 5 : (isMediumPerformance ? 10 : 20);
      let connectionCount = 0;

      // 计算交互距离
      const interactionDistance = isLowPerformance ? 100 : (isMediumPerformance ? 120 : 150);

      // 跳过一些粒子以减少计算量
      const particleSkip = isLowPerformance ? 5 : (isMediumPerformance ? 3 : 1);

      for (let i = 0; i < particles.length; i += particleSkip) {
        const particle = particles[i];
        const p1 = particle.position;
        const distance = p1.distanceTo(mouseParticle);

        if (distance < interactionDistance && connectionCount < maxMouseConnections) {
          positions.push(p1.x, p1.y, p1.z);
          positions.push(mouseParticle.x, mouseParticle.y, mouseParticle.z);

          const color1 = particle.material.color;
          const strength = (1 - distance / interactionDistance) * 0.7;

          colors.push(color1.r, color1.g, color1.b);
          colors.push(1, 1, 1);

          connectionCount++;
        }
      }
    }

    // 更新线条几何体
    linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    linesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    linesGeometry.attributes.position.needsUpdate = true;
    linesGeometry.attributes.color.needsUpdate = true;
  }

  // 优化窗口调整处理 - 使用节流函数减少频繁调整
  const handleResize = throttle(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // 根据性能级别调整渲染尺寸
    const pixelRatio = isLowPerformance ? Math.min(1.0, window.devicePixelRatio) :
                      (isMediumPerformance ? Math.min(1.5, window.devicePixelRatio) :
                      window.devicePixelRatio);

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(pixelRatio);
  }, 100); // 100ms 节流延迟

  window.addEventListener('resize', handleResize);

  // 使用 requestIdleCallback 延迟启动动画
  const startAnimation = () => {
    // 初始化连接线
    updateConnections(0);

    // 启动动画循环
    animate(0);

    // 移除生产环境日志 - 网络粒子性能指标
  };

  // 使用 requestIdleCallback 或 setTimeout 作为降级方案
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(startAnimation, { timeout: 2000 });
  } else {
    setTimeout(startAnimation, 200);
  }

  // 返回清理函数
  return function cleanup() {
    window.removeEventListener('resize', handleResize);

    // 正确移除事件监听器
    if (!isLowPerformance || !isMobile) {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseout', () => { mouseOver = false; });
    }

    // 从 DOM 中移除
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }

    // 释放资源
    // 使用共享几何体，只需要释放一次
    sharedGeometry.dispose();

    // 释放材质
    blockMaterials.forEach(material => {
      material.dispose();
    });

    if (glowMaterial) {
      glowMaterial.dispose();
    }

    // 释放粒子
    particles.forEach(particle => {
      // 不需要释放几何体，因为使用的是共享几何体

      // 释放发光效果
      if (particle.children.length > 0) {
        particle.children[0].geometry.dispose();
      }
    });

    // 释放连接线资源
    linesGeometry.dispose();
    connectionsMaterial.dispose();

    // 释放渲染器
    renderer.dispose();

    console.log('NetworkParticles: Resources cleaned up');
  };
}
