import * as THREE from 'three';

/**
 * SelectionManager class.
 */
class SelectionManager {
    /**
     * A default constructor.
     * @constructor
     */
    constructor() {
        console.log("SelectionManager created!");
    }

    static onPointerDown( event, scene, camera, callback ) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        raycaster.setFromCamera( mouse, camera );
        const intersects = raycaster.intersectObjects( scene.children, false );
        if ( intersects.length > 0 ) {

            const object = intersects[ 0 ].object;
            if (callback) {
                callback(object);
            }
        } else if (callback) {
            callback(null);
        }

    }

};

export {SelectionManager}