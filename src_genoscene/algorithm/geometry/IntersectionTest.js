// Stat.js
import { parseInt } from 'lodash';
import Stats from '../../../threejs_r155/examples/jsm/libs/stats.module.js';
import { THREE, OrbitControls, GUI, mergeGeometries } from '../../CommonImports.js'


const gridSize = 2;
const gridNumber = 32;
const offSet = gridSize / 2;

class IntersectionTest {

    constructor() {
        console.log("IntersectionTest executed!");
        var scope = this;
        this._this = this;
        const width = window.innerWidth;
        const height = window.innerHeight;
    
        this.scene = new THREE.Scene();
        const boxGeometry = new THREE.BoxGeometry(gridSize, gridSize, gridSize);

        const phongMaterial = new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            wireframe: true,
        });

        this.mesh = new THREE.Mesh(boxGeometry, phongMaterial);
        this.mesh.position.set(offSet, offSet, offSet);

        const axesHelper = new THREE.AxesHelper(150);

        // Light source
        const pointLight = new THREE.PointLight(0xffffff, 100.0, 300, 1);
        pointLight.position.set(40, 40, 0);
        const pointLightHelper = new THREE.PointLightHelper(pointLight, 1.0, 0xff0000ff);

        const directionalLight = new THREE.DirectionalLight(0xffffffff, 3.0);
        directionalLight.position.set(0.0, 60, 40);
        directionalLight.target = this.mesh;
        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1.0, 0xff0000);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);

        this.scene.add(axesHelper);
        // this.scene.add(this.mesh);
        this.scene.add(pointLight);
        // this.scene.add(pointLightHelper);
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);
        // this.scene.add(directionalLightHelper);

        // this.camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);
        var frustumSize = 1000; //设置显示相机前方1000高的内容
        var aspect = window.innerWidth / window.innerHeight; //计算场景的宽高比
        const aspectRatio = 1.0
        this.camera = new THREE.OrthographicCamera( 
            frustumSize * aspect / - aspectRatio, 
            frustumSize * aspect / aspectRatio,
            frustumSize / aspectRatio, 
            frustumSize / - aspectRatio, 
            1,
            2000 
        );

        // this.camera = new THREE.OrthographicCamera();
        this.camera.position.set(80, 80, 80);

        this.renderer = new THREE.WebGLRenderer( {antialias: true,} );
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x444444, 1.0);

        const controls = new OrbitControls(this.camera, this.renderer.domElement);

        document.getElementById("webgl").appendChild(this.renderer.domElement);

        // Performance monitor
        this.stats = new Stats();
        document.body.appendChild(this.stats.domElement);
        // 0 - FPS
        // 1 - ms per frame
        this.stats.setMode(1);

        window.addEventListener(
            'resize', function() {
                // Resize
                scope.renderer.setSize(window.innerWidth, window.innerHeight);
    
                scope.camera.aspect = window.innerWidth / window.innerHeight;
                // By default, renderer will cache the camera's Projection matrix for rendering.
                // Once it's changed, we need to update the projection matrix.
                scope.camera.updateProjectionMatrix();
            }
        );

        this.testTriangleVoxel();

        // GUI
        const myGui = new GUI();
        myGui.domElement.style.right = '0px';
        myGui.domElement.style.width = '300px';
        myGui.open();
        const geometryGUI = myGui.addFolder('StartTest');
        geometryGUI.close();
        geometryGUI.add(this.mesh.position, 'x', -100, 100).name('main object position X');
        geometryGUI.add(this.mesh.position, 'y', -100, 100).name('main object position Y');
        geometryGUI.add(this.mesh.position, 'z', -100, 100).name('main object position Z');
    }

    getRenderer() {
        return this.renderer;
    }
    
    render() {
        this.stats.update();
        this.renderer.render(this.scene, this.camera); //Render
    }

    isSame(x, y) {
        return Math.abs(x - y) < 1e-10;
    }

    findPointOnLine(x1, y1, x2, y2, givenCoordinate) {
        if (this.isSame(x1, x2) || this.isSame(y1, y2)) {
            return undefined;
        }
        // Calculate slope of the line
        let m = (y2 - y1) / (x2 - x1);
        
        // Calculate y-intercept of the line
        let b = y1 - m * x1;

        let minX = Math.min(x1, x2);
        let maxX = Math.max(x1, x2);
        let minY = Math.min(y1, y2);
        let maxY = Math.max(y1, y2);
        
        // Determine if the given coordinate is x or y based on the input
        if (typeof givenCoordinate.x !== 'undefined') {
            // Given x, solve for y
            let y = m * givenCoordinate.x + b;

            if (y < minY || y > maxY) return undefined;

            return { x: givenCoordinate.x, y };
        } else if (typeof givenCoordinate.y !== 'undefined') {
            // Given y, solve for x
            // Handle the special case where the line is vertical
            if (x2 === x1) {
                console.warn("The line is vertical; the x-coordinate will be the same as the given points.");
                return { x: x1, y: givenCoordinate.y };
            } else {
                let x = (givenCoordinate.y - b) / m;

                if (x < minX || x > maxX) return undefined;

                return { x, y: givenCoordinate.y };
            }
        } else {
            throw new Error("Invalid input: Please provide either an x or y coordinate.");
        }
    }

    drawLine(grid, x0, y0, x1, y1, gridSize) {
        let dx = Math.abs(x1 - x0);
        let dy = -Math.abs(y1 - y0);
        let sx = x0 < x1 ? gridSize : -gridSize;
        let sy = y0 < y1 ? gridSize : -gridSize;
        let err = dx + dy;
        let e2;
    
        while (true) {
            if (x0 >= 0 && x0 < grid.length * gridSize && y0 >= 0 && y0 < grid[0].length * gridSize) {
                let indexX = parseInt(x0 / gridSize);
                let indexY = parseInt(y0 / gridSize);
                grid[indexX][indexY] = 1; // Mark the voxel as part of the line

                // 检查相交的grid的四条边
                // Need to check the best combo
                let gX0 = (indexX - 1) * gridSize;
                let gX1 = (indexX + 1) * gridSize;
                let gY0 = (indexY - 1) * gridSize;
                let gY1 = (indexY + 1) * gridSize;

                let res = this.findPointOnLine(x0, y0, x1, y1, { x: gX0});
                if (res !== undefined && res.y > 0) {
                    let indexX1 = parseInt(res.x / gridSize);
                    let indexY1 = parseInt(res.y / gridSize);
                    if (indexX1 < grid.length && indexY1 < grid[0].length) {
                        grid[indexX1][indexY1] = 2;
                        grid[indexX1 - 1][indexY1] = 2;
                    }
                }

                res = this.findPointOnLine(x0, y0, x1, y1, { x: gX1});
                if (res !== undefined && res.y > 0) {
                    let indexX1 = parseInt(res.x / gridSize);
                    let indexY1 = parseInt(res.y / gridSize);
                    if (indexX1 < grid.length && indexY1 < grid[0].length)
                        grid[indexX1][indexY1] = 2;
                        // grid[indexX1 - 1][indexY1] = 2;
                }

                res = this.findPointOnLine(x0, y0, x1, y1, { y: gY0});
                if (res !== undefined && res.x > 0) {
                    let indexX1 = parseInt(res.x / gridSize);
                    let indexY1 = parseInt(res.y / gridSize);
                    if (indexX1 < grid.length && indexY1 < grid[0].length)
                        grid[indexX1][indexY1] = 2;
                        grid[indexX1][indexY1 - 1] = 2;
                }

                res = this.findPointOnLine(x0, y0, x1, y1, { y: gY1});
                if (res !== undefined && res.x > 0) {
                    let indexX1 = parseInt(res.x / gridSize);
                    let indexY1 = parseInt(res.y / gridSize);
                    if (indexX1 < grid.length && indexY1 < grid[0].length)
                        grid[indexX1][indexY1] = 2;
                }

            } else {
                break;
            }
    
            // if (x0 >= grid.length * gridSize || y0 >= grid[0].length * gridSize) break;

            e2 = 2 * err;
            if (e2 >= dy) {
                err += dy;
                x0 += sx;
            }
            if (e2 <= dx) {
                err += dx;
                y0 += sy;
            }
        }
    }
    

    render2DProjection(triangle, gridIndices, gSize) {
        let gStartY = parseInt(gridIndices[0][0] / gSize);
        let gStartZ = parseInt(gridIndices[0][1] / gSize);
        let gEndY = Math.ceil(gridIndices[1][0] / gSize);
        let gEndZ = Math.ceil(gridIndices[1][1] / gSize);
        gEndY = gEndY === parseInt(gridIndices[1][0] / gSize) ? gEndY + 1 : gEndY;
        gEndZ = gEndZ === parseInt(gridIndices[1][1] / gSize) ? gEndZ + 1 : gEndZ;

        let gridWidth = gEndZ - gStartZ + 1;
        let gridHeight = gEndY - gStartY + 1;

        let gridMap = new Array(gridHeight).fill(0).map(() => new Array(gridWidth).fill(0));

        let x0 = triangle[0][0];
        let y0 = triangle[0][1];
        let x1 = triangle[1][0];
        let y1 = triangle[1][1];
        let x2 = triangle[2][0];
        let y2 = triangle[2][1];

        this.drawLine(gridMap, x0, y0, x1, y1, gSize);
        this.drawLine(gridMap, x0, y0, x2, y2, gSize);
        this.drawLine(gridMap, x1, y1, x2, y2, gSize);

        console.log(gridMap);

        for (let ii = 0; ii < gridMap.length; ++ii) {
            for (let jj = 0; jj < gridMap[0].length; ++jj) {
                if (gridMap[ii][jj] === 1) {
                    this.renderAuxiliaryObjects(false, false, true, gSize, 0x0000ff, [
                        0, ii, jj,
                        1, ii + 1, jj + 1
                    ]);
                } else if (gridMap[ii][jj] === 2) {
                    this.renderAuxiliaryObjects(false, false, true, gSize, 0xff00ff, [
                        0, ii, jj,
                        1, ii + 1, jj + 1
                    ]);
                }
            }

        }

    }

    testTriangleVoxel() {
        console.log("This is just a test =============================");
        const triangle = new THREE.Triangle();
        const offSet = 36;

        // X projection - Right
        // triangle.a.set(10, 0, 30);
        // triangle.b.set(0, 0, 0);
        // triangle.c.set(10, 40,  30);

        triangle.a.set(10, 15, 30);
        triangle.b.set(0, 0, 0);
        triangle.c.set(10, 40, 15);

        // Y projection - Top
        // triangle.a.set(20, 20, 40);
        // triangle.b.set(0, 0, 0);
        // triangle.c.set(40, 0,  0);

        // Z projection - Front
        // triangle.a.set(-16  + offSet, 11  + offSet, 17  + offSet);
        // triangle.b.set(-32  + offSet, 32 + offSet, -8  + offSet);
        // triangle.c.set(-34  + offSet, 13  + offSet,  offSet);

        // Z projection 2 - Front
        // triangle.a.set(20, 40, 20);
        // triangle.b.set(0, 0, 0);
        // triangle.c.set(40, 0,  0);

        //
        let minX = Math.min(triangle.a.x, triangle.b.x, triangle.c.x);
        let minY = Math.min(triangle.a.y, triangle.b.y, triangle.c.y);
        let minZ = Math.min(triangle.a.z, triangle.b.z, triangle.c.z);

        let maxX = Math.max(triangle.a.x, triangle.b.x, triangle.c.x);
        let maxY = Math.max(triangle.a.y, triangle.b.y, triangle.c.y);
        let maxZ = Math.max(triangle.a.z, triangle.b.z, triangle.c.z);

        this.renderProcessedTriangles(triangle);

        let _gridSize = gridSize;

        this.render2DProjection(
            [
                [triangle.a.y, triangle.a.z],
                [triangle.b.y, triangle.b.z],
                [triangle.c.y, triangle.c.z]
            ],
            [
                [minY, minZ],
                [maxY, maxZ]
            ],
            _gridSize
        );

    }

    renderProcessedTriangles(triangle) {
        let t = triangle;
        let geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array(
            [
                t.a.x, t.a.y, t.a.z,
                t.b.x, t.b.y, t.b.z,
                t.c.x, t.c.y, t.c.z
            ]
        );
        geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
        let testTriangleMesh = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({
                color: 0xff0000,
                wireframe: true,
            })
        );
        // testTriangleMesh.position.set(_sceneBasePoint.x, _sceneBasePoint.y, _sceneBasePoint.z);
        this.scene.add(testTriangleMesh);
    }

    renderAuxiliaryObjects (shouldRenderBasePoint = true,
        shouldRenderBoundary = false,
        shouldRenderGrids = false,
        sceneGridSize,
        newColor = 0x0000ff,
        gridBoundary = [0, 0, 0, 32, 32, 32]) {
        if (shouldRenderBasePoint) {
            let startingPoint = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, 0.6, 0.6),
                new THREE.MeshBasicMaterial({
                    color: 0xff0000,
                })
            );
            // startingPoint.position.set(_sceneBasePoint.x, _sceneBasePoint.y, _sceneBasePoint.z);
            this.scene.add(startingPoint);
        }

        if (shouldRenderBoundary) {
            // Render grid
            let startGridX = gridBoundary[0];
            let startGridY = gridBoundary[1];
            let startGridZ = gridBoundary[2];
            let endGridX = gridBoundary[3];
            let endGridY = gridBoundary[4];
            let endGridZ = gridBoundary[5];

            let totalNumberOfGridsX = endGridX - startGridX;
            let totalNumberOfGridsY = endGridY - startGridY;
            let totalNumberOfGridsZ = endGridZ - startGridZ;
            
            const boxGeometry = new THREE.BoxGeometry(
                totalNumberOfGridsX * sceneGridSize,
                totalNumberOfGridsY * sceneGridSize,
                totalNumberOfGridsZ * sceneGridSize
            );
            const object = new THREE.Mesh( boxGeometry, new THREE.MeshBasicMaterial( 0xff0000 ) );
            object.position.set(
                totalNumberOfGridsX / 2 * sceneGridSize,
                totalNumberOfGridsY / 2 * sceneGridSize,
                totalNumberOfGridsZ / 2 * sceneGridSize,
            );
            const box = new THREE.BoxHelper( object, 0xff00ff );
            this.scene.add(box);
        }

        if (shouldRenderGrids) {
            let halfGridSize = sceneGridSize / 2.0;
            // Render grid
            let startGridX = gridBoundary[0];
            let startGridY = gridBoundary[1];
            let startGridZ = gridBoundary[2];
            let endGridX = gridBoundary[3];
            let endGridY = gridBoundary[4];
            let endGridZ = gridBoundary[5];

            let totalNumberOfGridsX = endGridX - startGridX;
            let totalNumberOfGrids = totalNumberOfGridsX * (endGridY - startGridY) * (endGridZ - startGridZ);
            let totalNumberOfGrids2DXY = totalNumberOfGridsX * (endGridY - startGridY);
            let gridGeometry = new THREE.BoxGeometry(sceneGridSize, sceneGridSize, sceneGridSize);

            let instancedMesh = new THREE.InstancedMesh(
                gridGeometry,
                new THREE.MeshBasicMaterial(
                    {
                        color: newColor,
                        wireframe: true
                    }
                ),
                totalNumberOfGrids
            );
            let transformMatrix = new THREE.Matrix4();
            let startPosX = halfGridSize + startGridX * sceneGridSize;
            let startPosY = halfGridSize + startGridY * sceneGridSize;
            let startPosZ = halfGridSize + startGridZ * sceneGridSize;

            let posX = startPosX;
            let posY = startPosY;
            let posZ = startPosZ;
            for (let ii = 0; ii < totalNumberOfGrids; ++ii) {
                transformMatrix = transformMatrix.setPosition(posX, posY, posZ);
                instancedMesh.setMatrixAt(ii, transformMatrix);
                if ((ii + 1) % totalNumberOfGrids2DXY == 0) {
                    posZ += sceneGridSize;
                    posX = startPosX;
                    posY = startPosY;
                } else if ((ii + 1) % totalNumberOfGridsX == 0) {
                    posY += sceneGridSize
                    posX = startPosX;
                } else {
                    posX += sceneGridSize;
                }
            }
            this.scene.add(
                instancedMesh
            );
        }
    }

};

export {IntersectionTest}


