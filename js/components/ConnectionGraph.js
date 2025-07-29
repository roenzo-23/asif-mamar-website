/**
 * Connection Graph component for visualizing user connections using Canvas
 */
class ConnectionGraph {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas with ID '${canvasId}' not found`);
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.options = {
            nodeRadius: 15,
            nodeColor: '#4f46e5',
            connectionColor: '#cbd5e1',
            activeConnectionColor: '#4f46e5',
            backgroundColor: 'transparent',
            animationSpeed: 0.02,
            maxNodes: 20,
            springLength: 100,
            springStrength: 0.01,
            damping: 0.95,
            centerForce: 0.001,
            ...options
        };

        this.nodes = [];
        this.connections = [];
        this.animationId = null;
        this.time = 0;
        this.isAnimating = false;

        this.setupCanvas();
        this.generateSampleData();
        this.startAnimation();
    }

    /**
     * Setup canvas dimensions and styling
     */
    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.ctx.scale(dpr, dpr);
        
        this.width = rect.width;
        this.height = rect.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }

    /**
     * Generate sample nodes and connections for visualization
     */
    generateSampleData() {
        const skillCategories = [
            'JavaScript', 'Python', 'React', 'Node.js', 'AI/ML',
            'Design', 'DevOps', 'Mobile', 'Data', 'Cloud'
        ];

        // Generate nodes
        for (let i = 0; i < Math.min(this.options.maxNodes, skillCategories.length); i++) {
            const angle = (i / skillCategories.length) * Math.PI * 2;
            const radius = Math.min(this.width, this.height) * 0.25;
            
            this.nodes.push({
                id: i,
                x: this.centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 50,
                y: this.centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 50,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: this.options.nodeRadius + Math.random() * 5,
                skill: skillCategories[i],
                connections: 0,
                pulse: Math.random() * Math.PI * 2
            });
        }

        // Generate connections
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                if (Math.random() < 0.3) { // 30% chance of connection
                    this.connections.push({
                        from: i,
                        to: j,
                        strength: 0.5 + Math.random() * 0.5,
                        opacity: 0.3 + Math.random() * 0.4,
                        animated: Math.random() < 0.2 // 20% chance of animation
                    });
                    this.nodes[i].connections++;
                    this.nodes[j].connections++;
                }
            }
        }
    }

    /**
     * Update node positions using physics simulation
     */
    updatePhysics() {
        const { springLength, springStrength, damping, centerForce } = this.options;

        // Apply forces
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            
            // Center force
            const dcx = this.centerX - node.x;
            const dcy = this.centerY - node.y;
            const centerDistance = Math.sqrt(dcx * dcx + dcy * dcy);
            
            if (centerDistance > 0) {
                node.vx += (dcx / centerDistance) * centerForce * centerDistance;
                node.vy += (dcy / centerDistance) * centerForce * centerDistance;
            }

            // Repulsion force between nodes
            for (let j = 0; j < this.nodes.length; j++) {
                if (i === j) continue;
                
                const other = this.nodes[j];
                const dx = node.x - other.x;
                const dy = node.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0 && distance < springLength * 2) {
                    const force = (springLength * 2 - distance) * 0.01;
                    node.vx += (dx / distance) * force;
                    node.vy += (dy / distance) * force;
                }
            }
        }

        // Apply spring forces for connections
        for (const connection of this.connections) {
            const nodeA = this.nodes[connection.from];
            const nodeB = this.nodes[connection.to];
            
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                const force = (distance - springLength) * springStrength * connection.strength;
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;
                
                nodeA.vx += fx;
                nodeA.vy += fy;
                nodeB.vx -= fx;
                nodeB.vy -= fy;
            }
        }

        // Update positions and apply damping
        for (const node of this.nodes) {
            node.vx *= damping;
            node.vy *= damping;
            node.x += node.vx;
            node.y += node.vy;
            
            // Keep nodes within bounds
            const margin = node.radius;
            if (node.x < margin) {
                node.x = margin;
                node.vx *= -0.5;
            }
            if (node.x > this.width - margin) {
                node.x = this.width - margin;
                node.vx *= -0.5;
            }
            if (node.y < margin) {
                node.y = margin;
                node.vy *= -0.5;
            }
            if (node.y > this.height - margin) {
                node.y = this.height - margin;
                node.vy *= -0.5;
            }

            // Update pulse for animation
            node.pulse += 0.05;
        }
    }

    /**
     * Render the graph
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = this.options.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw connections
        this.ctx.lineWidth = 2;
        for (const connection of this.connections) {
            const nodeA = this.nodes[connection.from];
            const nodeB = this.nodes[connection.to];
            
            let opacity = connection.opacity;
            if (connection.animated) {
                opacity *= 0.5 + 0.5 * Math.sin(this.time * 3 + connection.from);
            }
            
            this.ctx.strokeStyle = `rgba(75, 85, 99, ${opacity})`;
            this.ctx.beginPath();
            this.ctx.moveTo(nodeA.x, nodeA.y);
            this.ctx.lineTo(nodeB.x, nodeB.y);
            this.ctx.stroke();
        }

        // Draw nodes
        for (const node of this.nodes) {
            const pulseScale = 1 + 0.1 * Math.sin(node.pulse);
            const radius = node.radius * pulseScale;
            
            // Node shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.beginPath();
            this.ctx.arc(node.x + 2, node.y + 2, radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Node fill
            const intensity = Math.min(node.connections / 3, 1);
            const red = Math.floor(79 + (139 - 79) * intensity);
            const green = Math.floor(70 + (92 - 70) * intensity);
            const blue = Math.floor(229 + (239 - 229) * intensity);
            
            this.ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Node border
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Node center dot
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, radius * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw floating particles
        this.drawParticles();
    }

    /**
     * Draw floating particles for visual effect
     */
    drawParticles() {
        const particleCount = 5;
        this.ctx.fillStyle = 'rgba(79, 70, 229, 0.3)';
        
        for (let i = 0; i < particleCount; i++) {
            const x = this.centerX + Math.cos(this.time * 0.5 + i * 1.2) * (50 + i * 20);
            const y = this.centerY + Math.sin(this.time * 0.3 + i * 0.8) * (30 + i * 15);
            const radius = 2 + Math.sin(this.time * 2 + i) * 1;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    /**
     * Animation loop
     */
    animate() {
        if (!this.isAnimating) return;
        
        this.time += this.options.animationSpeed;
        this.updatePhysics();
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Start animation
     */
    startAnimation() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.animate();
    }

    /**
     * Stop animation
     */
    stopAnimation() {
        this.isAnimating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Add a new node to the graph
     * @param {Object} nodeData - Node data
     */
    addNode(nodeData) {
        if (this.nodes.length >= this.options.maxNodes) return;
        
        const node = {
            id: this.nodes.length,
            x: this.centerX + (Math.random() - 0.5) * 100,
            y: this.centerY + (Math.random() - 0.5) * 100,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            radius: this.options.nodeRadius,
            connections: 0,
            pulse: Math.random() * Math.PI * 2,
            ...nodeData
        };
        
        this.nodes.push(node);
        
        // Add some random connections
        for (let i = 0; i < this.nodes.length - 1; i++) {
            if (Math.random() < 0.2) {
                this.connections.push({
                    from: i,
                    to: this.nodes.length - 1,
                    strength: 0.5 + Math.random() * 0.5,
                    opacity: 0.3 + Math.random() * 0.4,
                    animated: Math.random() < 0.3
                });
                this.nodes[i].connections++;
                node.connections++;
            }
        }
    }

    /**
     * Remove a node from the graph
     * @param {number} nodeId - Node ID to remove
     */
    removeNode(nodeId) {
        // Remove connections involving this node
        this.connections = this.connections.filter(conn => 
            conn.from !== nodeId && conn.to !== nodeId
        );
        
        // Remove the node
        this.nodes = this.nodes.filter(node => node.id !== nodeId);
        
        // Update node IDs and connection references
        this.nodes.forEach((node, index) => {
            node.id = index;
        });
        
        this.connections.forEach(conn => {
            if (conn.from > nodeId) conn.from--;
            if (conn.to > nodeId) conn.to--;
        });
    }

    /**
     * Update graph based on user data
     * @param {Array} users - Array of user objects
     * @param {Array} connections - Array of connection objects
     */
    updateFromUserData(users, connections) {
        // Clear existing data
        this.nodes = [];
        this.connections = [];
        
        // Create nodes from users (limit to maxNodes)
        const limitedUsers = users.slice(0, this.options.maxNodes);
        limitedUsers.forEach((user, index) => {
            this.nodes.push({
                id: index,
                x: this.centerX + (Math.random() - 0.5) * 200,
                y: this.centerY + (Math.random() - 0.5) * 200,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: this.options.nodeRadius + user.skillsOffered.length,
                userId: user.id,
                userName: user.name,
                connections: 0,
                pulse: Math.random() * Math.PI * 2
            });
        });
        
        // Create connections
        connections.forEach(conn => {
            const fromIndex = this.nodes.findIndex(n => n.userId === conn.fromUserId);
            const toIndex = this.nodes.findIndex(n => n.userId === conn.toUserId);
            
            if (fromIndex !== -1 && toIndex !== -1) {
                this.connections.push({
                    from: fromIndex,
                    to: toIndex,
                    strength: 0.7,
                    opacity: 0.6,
                    animated: true
                });
                this.nodes[fromIndex].connections++;
                this.nodes[toIndex].connections++;
            }
        });
    }

    /**
     * Resize canvas when container size changes
     */
    resize() {
        this.setupCanvas();
    }

    /**
     * Destroy the graph and cleanup
     */
    destroy() {
        this.stopAnimation();
        this.nodes = [];
        this.connections = [];
        this.canvas = null;
        this.ctx = null;
    }

    /**
     * Get canvas as image data URL
     * @returns {string} Image data URL
     */
    toDataURL() {
        return this.canvas.toDataURL();
    }
}

// Export for global use
window.ConnectionGraph = ConnectionGraph;