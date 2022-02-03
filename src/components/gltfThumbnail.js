import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader } from "@react-three/fiber";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

export default function GltfThumbnail(props) {
  const gltf = useLoader(GLTFLoader, props.url);

  return (
    <div>
      <Canvas>
        <Suspense fallback={null}>
          <primitive object={gltf.scene} scale={0.4} />
        </Suspense>
      </Canvas>
    </div>
  );
}
