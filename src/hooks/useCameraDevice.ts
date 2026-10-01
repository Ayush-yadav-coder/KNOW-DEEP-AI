import { useState, useEffect, useCallback } from "react";

export interface CameraDeviceInfo {
  deviceId: string;
  label: string;
  facingMode?: "user" | "environment" | "unknown";
}

export function useCameraDevice() {
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [cameras, setCameras] = useState<CameraDeviceInfo[]>([]);
  const [isDetecting, setIsDetecting] = useState(true);
  const [permissionState, setPermissionState] = useState<
    "granted" | "prompt" | "denied" | "unsupported"
  >("prompt");

  const detectCameras = useCallback(async () => {
    if (typeof window === "undefined" || !navigator?.mediaDevices?.enumerateDevices) {
      setHasCamera(false);
      setCameras([]);
      setIsDetecting(false);
      return;
    }

    // Check permission status gracefully without triggering prompts
    try {
      if (navigator.permissions?.query) {
        const perm = await navigator.permissions.query({ name: "camera" as PermissionName });
        setPermissionState(perm.state as "granted" | "prompt" | "denied");
        perm.onchange = () => {
          setPermissionState(perm.state as "granted" | "prompt" | "denied");
        };
      }
    } catch {
      // Permissions API query for camera not supported in all browsers
      setPermissionState("unsupported");
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === "videoinput");

      const mappedCameras: CameraDeviceInfo[] = videoInputs.map((d, index) => {
        let facing: "user" | "environment" | "unknown" = "unknown";
        const label = (d.label || "").toLowerCase();
        if (label.includes("back") || label.includes("rear") || label.includes("environment")) {
          facing = "environment";
        } else if (label.includes("front") || label.includes("user") || label.includes("selfie")) {
          facing = "user";
        }

        return {
          deviceId: d.deviceId,
          label: d.label || `Camera ${index + 1}`,
          facingMode: facing,
        };
      });

      setCameras(mappedCameras);
      setHasCamera(mappedCameras.length > 0);
    } catch (err) {
      console.warn("Hardware camera enumeration note:", err);
      setHasCamera(false);
      setCameras([]);
    } finally {
      setIsDetecting(false);
    }
  }, []);

  useEffect(() => {
    detectCameras();

    if (navigator?.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener("devicechange", detectCameras);
      return () => {
        navigator.mediaDevices.removeEventListener("devicechange", detectCameras);
      };
    }
  }, [detectCameras]);

  return {
    hasCamera: hasCamera === true,
    isDetecting,
    cameras,
    multipleCameras: cameras.length > 1,
    permissionState,
    reDetect: detectCameras,
  };
}
