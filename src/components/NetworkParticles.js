import * as THREE from 'three';

// Initialize Three.js scene with network particles effect
export function initNetworkParticles() {
  // Check if already initialized
  if (document.getElementById('network-particles-container')) {
    return;
  }

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

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0.3); // 70% transparency (1-0.7)
  renderer.setPixelRatio(window.devicePixelRatio);

  // Add renderer to DOM
  container.appendChild(renderer.domElement);

  // Create multiple walls with 3D blocks
  const wallCount = 6; // Number of walls
  const wallGridSize = 4; // 4x4 grid per wall (reduced for performance)
  const spacing = 40; // Increased spacing
  const particles = [];
  
  // Wall positions in 3D space
  const wallPositions = [
    {x: -200, y: 0, z: 0, rotY: 0},
    {x: 200, y: 0, z: 0, rotY: Math.PI},
    {x: 0, y: -150, z: 0, rotY: Math.PI/2},
    {x: 0, y: 150, z: 0, rotY: -Math.PI/2},
    {x: 0, y: 0, z: -200, rotY: 0},
    {x: 0, y: 0, z: 200, rotY: Math.PI}
  ];

  // Use spheres for blockchain nodes
  const blockGeometry = new THREE.SphereGeometry(1.2, 16, 16);
  
  // Node colors - blue/purple gradient
  const blockColors = [
    0x1a237e, 0x283593, 0x4527a0,
    0x5e35b1, 0x7e57c2, 0x9575cd,
    0xb39ddb, 0xd1c4e9, 0xede7f6
  ];
  
  // Create node materials
  const blockMaterials = blockColors.map(color => 
    new THREE.MeshPhongMaterial({ 
      color: color,
      emissive: 0x1a237e,
      emissiveIntensity: 0.2,
      specular: 0xffffff,
      shininess: 30,
      transparent: true,
      opacity: 0.65 // Reduced block opacity
    })
  );

  // Create glow material for nodes
  const glowMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x7c4dff, // Keep color for subtle effect
    transparent: true,
    opacity: 0.2, // Reduced glow opacity significantly
    side: THREE.BackSide
  });

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
        
        cubeVertices.forEach(vertex => {
          const block = new THREE.Mesh(blockGeometry, blockMaterials[materialIdx]);
          
          // Position blocks to form cube vertices
          const localX = (x - wallGridSize/2) * spacing + vertex.x * spacing * 0.6;
          const localY = (y - wallGridSize/2) * spacing + vertex.y * spacing * 0.6;
          const localZ = vertex.z * spacing * 0.6;

          // Apply wall position and rotation
          block.position.x = wallPos.x + localX * Math.cos(wallPos.rotY) + localZ * Math.sin(wallPos.rotY);
          block.position.y = wallPos.y + localY;
          block.position.z = wallPos.z + localZ * Math.cos(wallPos.rotY) - localX * Math.sin(wallPos.rotY);
          
          // Scale blocks
          const size = 1.5;
          block.scale.set(size, size, size);
          
          // Add spherical glow to every node
          const glow = new THREE.Mesh(
            new THREE.SphereGeometry(1.5, 16, 16),
            glowMaterial
          );
          glow.scale.set(size * 1.5, size * 1.5, size * 1.5);
          block.add(glow);

          // Add pulse animation
          block.userData = {
            pulseSpeed: 0.02 + Math.random() * 0.01,
            pulsePhase: Math.random() * Math.PI * 2,
            wallId: wallIdx
          };
          
          // Add to scene
          scene.add(block);
          particles.push(block);
        });
      }
    }
  }

  // Create curved connections with flowing effect
  const connectionsMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.4, // Reduced line opacity
    blending: THREE.AdditiveBlending, // Keep additive blending for glow effect
    linewidth: 1.5 // Slightly thinner lines
  });

  // Lines will be updated dynamically
  const linesGeometry = new THREE.BufferGeometry();
  const lines = new THREE.LineSegments(linesGeometry, connectionsMaterial);
  scene.add(lines);

  // Add some ambient light for better visibility
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  // Add point light in the center
  const pointLight = new THREE.PointLight(0x4facfe, 1, 1000);
  pointLight.position.set(0, 0, 0);
  scene.add(pointLight);

  // Mouse interaction
  const mouse = new THREE.Vector2();
  const mouseParticle = new THREE.Vector3();
  let mouseOver = false;

  // Track mouse position
  container.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Convert mouse position to 3D space
    mouseParticle.set(mouse.x * 500, mouse.y * 300, 0);
    mouseOver = true;
  });

  container.addEventListener('mouseout', () => {
    mouseOver = false;
  });

  // Animation
  function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001; // Current time in seconds

    // Update particles
    particles.forEach(particle => {
    // Pulse effect
    const pulseAmount = Math.sin(time * particle.userData.pulseSpeed + particle.userData.pulsePhase) * 0.1 + 1;
    particle.scale.set(
      pulseAmount, pulseAmount, pulseAmount
    );
    
    // Pulse glow
    if (particle.children.length > 0) {
      const glow = particle.children[0];
      glow.material.opacity = 0.3 + Math.sin(time * 3 + particle.userData.pulsePhase) * 0.1;
    }
    });

    // Update connections
    updateConnections();

    // Animate point light
    pointLight.intensity = 1 + Math.sin(time) * 0.3;
    pointLight.color.setHSL((time * 0.05) % 1, 0.7, 0.5); // Cycle through colors

    // Rotate entire grid slowly around Y axis
    scene.rotation.y = time * 0.1;
    
    // Camera position - fixed view of the grid
    camera.position.set(0, 0, 600);
    camera.lookAt(scene.position);

    // Render
    renderer.render(scene, camera);
  }

  // Update connections between blocks with curves
  function updateConnections() {
    const positions = [];
    const colors = [];
    const time = Date.now() * 0.001;
    const blocksPerWall = wallGridSize * wallGridSize * 8;
    
    // Create curved connections
    const createCurve = (p1, p2, color1, color2, strength) => {
      const curve = new THREE.CatmullRomCurve3([
        p1.clone(),
        new THREE.Vector3(
          (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 1,
          (p1.y + p2.y) / 2 + (Math.random() - 0.5) * 1,
          (p1.z + p2.z) / 2 + (Math.random() - 0.5) * 1
        ),
        p2.clone()
      ]);
      
      const points = curve.getPoints(5); // Reduced from 10 to 5 for performance
      for (let i = 0; i < points.length - 1; i++) {
        positions.push(points[i].x, points[i].y, points[i].z);
        positions.push(points[i+1].x, points[i+1].y, points[i+1].z);
        
        const fade = i / points.length;
        colors.push(
          // Use color values directly for vertex colors
          color1.r * (1-fade) + color2.r * fade,
          color1.g * (1-fade) + color2.g * fade,
          color1.b * (1-fade) + color2.b * fade
          // Alpha is now controlled by the material's opacity
        );
        colors.push(
          color1.r * (1-fade) + color2.r * fade,
          color1.g * (1-fade) + color2.g * fade,
          color1.b * (1-fade) + color2.b * fade
        );
      }
    };

    // Connect blocks within each wall
    for (let wallIdx = 0; wallIdx < wallCount; wallIdx++) {
      const wallStart = wallIdx * blocksPerWall;
      
      for (let i = wallStart; i < wallStart + blocksPerWall; i += 8) {
        // Connect all 12 edges of the cube
        const cubeEdges = [
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
    
    // Connect some blocks between walls
    for (let i = 0; i < particles.length; i += 9) {
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
    
    // Connect to mouse if hovering
    if (mouseOver) {
      particles.forEach(particle => {
        const p1 = particle.position;
        const distance = p1.distanceTo(mouseParticle);
        
        if (distance < 150) {
          positions.push(p1.x, p1.y, p1.z);
          positions.push(mouseParticle.x, mouseParticle.y, mouseParticle.z);
          
          const color1 = particle.material.color;
          const strength = (1 - distance / 150) * 0.7;
          
          colors.push(color1.r, color1.g, color1.b, strength);
          colors.push(1, 1, 1, strength);
        }
      });
    }

    // Update line geometry - using 3 components for color now (RGB)
    linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    linesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); // Changed size to 3
    linesGeometry.attributes.position.needsUpdate = true;
    linesGeometry.attributes.color.needsUpdate = true;
  }

  // Handle window resize
  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener('resize', handleResize);

  // Start animation
  animate();

  // Return cleanup function
  return function cleanup() {
    window.removeEventListener('resize', handleResize);
    container.removeEventListener('mousemove', () => {});
    container.removeEventListener('mouseout', () => {});

    // Remove from DOM
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }

    // Dispose resources
    particles.forEach(particle => {
      particle.geometry.dispose();
      particle.material.dispose();

      // Dispose glow if exists
      if (particle.children.length > 0) {
        particle.children[0].geometry.dispose();
        particle.children[0].material.dispose();
      }
    });

    linesGeometry.dispose();
    connectionsMaterial.dispose();
    renderer.dispose();
  };
}
