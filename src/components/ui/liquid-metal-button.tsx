'use client';

import {
  liquidMetalFragmentShader,
  ShaderMount,
  getShaderColorFromString,
} from "@paper-design/shaders";
import { ArrowRight, Sparkles } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

export interface LiquidMetalButtonProps {
  id?: string;
  label?: string;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  viewMode?: "text" | "icon";
  showArrow?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  width?: number;
  height?: number;
}

export function LiquidMetalButton({
  id,
  label = "Send Message",
  onClick,
  viewMode = "text",
  showArrow = true,
  icon,
  disabled = false,
  loading = false,
  type = "button",
  className = "",
  width: customWidth,
  height: customHeight = 48,
}: LiquidMetalButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<
    Array<{ x: number; y: number; id: number }>
  >([]);
  const shaderRef = useRef<HTMLDivElement>(null);
  // biome-ignore lint/suspicious/noExplicitAny: External library without types
  const shaderMount = useRef<any>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleId = useRef(0);

  const dimensions = useMemo(() => {
    const h = customHeight;
    if (viewMode === "icon") {
      const w = customWidth ?? h;
      return {
        width: w,
        height: h,
        innerWidth: w - 4,
        innerHeight: h - 4,
        shaderWidth: w,
        shaderHeight: h,
      };
    } else {
      // Auto-fit label width nicely if not explicitly provided
      const estimatedWidth = Math.max(160, label.length * 9 + (showArrow ? 52 : 36));
      const w = customWidth ?? estimatedWidth;
      return {
        width: w,
        height: h,
        innerWidth: w - 4,
        innerHeight: h - 4,
        shaderWidth: w,
        shaderHeight: h,
      };
    }
  }, [viewMode, customWidth, customHeight, label, showArrow]);

  useEffect(() => {
    const styleId = "shader-canvas-style-purple-exploded";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .shader-container-exploded-purple canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border-radius: 9999px !important;
          opacity: 0.75;
          mix-blend-mode: screen;
          pointer-events: none;
        }
        @keyframes purple-ripple-animation {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.75;
          }
          100% {
            transform: translate(-50%, -50%) scale(4.5);
            opacity: 0;
          }
        }
        @keyframes liquid-spinner-spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    const loadShader = async () => {
      try {
        if (shaderRef.current && typeof window !== "undefined") {
          if (shaderMount.current?.destroy) {
            shaderMount.current.destroy();
          }

          // Electric purple color tinting for liquid metal
          const purpleTint = getShaderColorFromString("#c084fc");
          const purpleBack = getShaderColorFromString("#6b21a8");

          shaderMount.current = new ShaderMount(
            shaderRef.current,
            liquidMetalFragmentShader,
            {
              u_colorTint: purpleTint,
              u_colorBack: purpleBack,
              u_repetition: 3.5,
              u_softness: 0.6,
              u_shiftRed: 0.45,
              u_shiftBlue: 0.65,
              u_distortion: 0.08,
              u_contour: 0.15,
              u_angle: 45,
              u_scale: 7,
              u_shape: 1,
              u_offsetX: 0.1,
              u_offsetY: -0.1,
            },
            undefined,
            0.6,
          );
        }
      } catch (error) {
        console.error("[LiquidMetalButton] Failed to load shader:", error);
      }
    };

    loadShader();

    return () => {
      if (shaderMount.current?.destroy) {
        shaderMount.current.destroy();
        shaderMount.current = null;
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (disabled) return;
    setIsHovered(true);
    shaderMount.current?.setSpeed?.(1.2);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
    shaderMount.current?.setSpeed?.(0.6);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (shaderMount.current?.setSpeed) {
      shaderMount.current.setSpeed(2.4);
      setTimeout(() => {
        if (isHovered) {
          shaderMount.current?.setSpeed?.(1.2);
        } else {
          shaderMount.current?.setSpeed?.(0.6);
        }
      }, 300);
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ripple = { x, y, id: rippleId.current++ };

      setRipples((prev) => [...prev, ripple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
      }, 600);
    }

    onClick?.(e);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        style={{
          perspective: "1000px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          style={{
            position: "relative",
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            transformStyle: "preserve-3d",
            transition:
              "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s ease, height 0.3s ease",
            transform: isHovered ? "translateY(-1.5px)" : "none",
          }}
        >
          {/* CONTENT LAYER (Text / Icons) */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "0 22px",
              transformStyle: "preserve-3d",
              transition:
                "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s ease, height 0.3s ease, gap 0.3s ease",
              transform: "translateZ(20px)",
              zIndex: 30,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {viewMode === "icon" && (
              icon ? (
                icon
              ) : (
                <Sparkles
                  size={18}
                  style={{
                    color: "#ffffff",
                    filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.4))",
                    transition: "all 0.4s ease",
                    transform: isHovered ? "rotate(12deg) scale(1.1)" : "scale(1)",
                  }}
                />
              )
            )}

            {viewMode === "text" && (
              <>
                {loading ? (
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      border: "2.5px solid rgba(255, 255, 255, 0.35)",
                      borderTopColor: "#ffffff",
                      animation: "liquid-spinner-spin 0.7s linear infinite",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  icon && <span className="inline-flex shrink-0">{icon}</span>
                )}
                <span
                  style={{
                    fontSize: "15px",
                    color: "#ffffff",
                    fontWeight: 600,
                    letterSpacing: "0.01em",
                    textShadow:
                      "0px 1px 2px rgba(0, 0, 0, 0.3), 0 0 12px rgba(216, 180, 254, 0.4)",
                    transition: "all 0.3s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  {loading ? "Sending..." : label}
                </span>

                {showArrow && !loading && (
                  <ArrowRight
                    size={17}
                    strokeWidth={2.4}
                    style={{
                      color: "#ffffff",
                      filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.3))",
                      transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      transform: isHovered ? "translateX(4px)" : "translateX(0)",
                      flexShrink: 0,
                    }}
                  />
                )}
              </>
            )}
          </div>

          {/* INNER PURPLE GRADIENT BODY */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              transformStyle: "preserve-3d",
              transition:
                "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s ease, height 0.3s ease",
              transform: `translateZ(10px) ${
                isPressed
                  ? "translateY(1px) scale(0.97)"
                  : isHovered
                    ? "scale(1.01)"
                    : "scale(1)"
              }`,
              zIndex: 20,
            }}
          >
            <div
              style={{
                width: `${dimensions.innerWidth}px`,
                height: `${dimensions.innerHeight}px`,
                margin: "2px",
                borderRadius: "9999px",
                background: isHovered
                  ? "linear-gradient(135deg, #9333ea 0%, #7e22ce 40%, #6b21a8 100%)"
                  : "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 45%, #6d28d9 100%)",
                border: "1px solid rgba(233, 213, 255, 0.35)",
                boxShadow: isPressed
                  ? "inset 0px 2px 4px rgba(0, 0, 0, 0.4), inset 0px 1px 2px rgba(0, 0, 0, 0.3)"
                  : "inset 0px 1px 1.5px rgba(255, 255, 255, 0.4), inset 0px -2px 5px rgba(59, 7, 100, 0.4)",
                transition:
                  "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease, box-shadow 0.15s ease",
              }}
            />
          </div>

          {/* SHADER & GLOW BASE LAYER */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              transformStyle: "preserve-3d",
              transition:
                "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s ease, height 0.3s ease",
              transform: `translateZ(0px) ${
                isPressed
                  ? "translateY(1px) scale(0.97)"
                  : isHovered
                    ? "scale(1.01)"
                    : "scale(1)"
              }`,
              zIndex: 10,
            }}
          >
            <div
              style={{
                height: `${dimensions.height}px`,
                width: `${dimensions.width}px`,
                borderRadius: "9999px",
                boxShadow: isPressed
                  ? "0px 0px 0px 1px rgba(147, 51, 234, 0.4), 0px 2px 8px rgba(109, 40, 217, 0.4)"
                  : isHovered
                    ? "0px 0px 0px 1px rgba(216, 180, 254, 0.7), 0px 8px 30px rgba(124, 58, 237, 0.65), 0px 0px 20px rgba(168, 85, 247, 0.45)"
                    : "0px 0px 0px 1px rgba(167, 139, 250, 0.35), 0px 4px 18px rgba(109, 40, 217, 0.45), 0px 0px 14px rgba(124, 58, 237, 0.25)",
                transition:
                  "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease",
                background: "transparent",
              }}
            >
              <div
                ref={shaderRef}
                className="shader-container-exploded-purple"
                style={{
                  borderRadius: "9999px",
                  overflow: "hidden",
                  position: "relative",
                  width: `${dimensions.shaderWidth}px`,
                  maxWidth: `${dimensions.shaderWidth}px`,
                  height: `${dimensions.shaderHeight}px`,
                  transition: "width 0.3s ease, height 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* INTERACTION BUTTON OVERLAY */}
          <button
            ref={buttonRef}
            id={id}
            type={type}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={() => !disabled && !loading && setIsPressed(true)}
            onMouseUp={() => !disabled && !loading && setIsPressed(false)}
            disabled={disabled || loading}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              background: "transparent",
              border: "none",
              cursor: disabled || loading ? "not-allowed" : "pointer",
              outline: "none",
              zIndex: 40,
              transformStyle: "preserve-3d",
              transform: "translateZ(25px)",
              transition:
                "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s ease, height 0.3s ease",
              overflow: "hidden",
              borderRadius: "9999px",
              opacity: disabled ? 0.6 : 1,
            }}
            aria-label={label}
          >
            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                style={{
                  position: "absolute",
                  left: `${ripple.x}px`,
                  top: `${ripple.y}px`,
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(243, 232, 255, 0.8) 0%, rgba(192, 132, 252, 0.5) 40%, rgba(147, 51, 234, 0) 70%)",
                  pointerEvents: "none",
                  animation: "purple-ripple-animation 0.6s ease-out forwards",
                }}
              />
            ))}
          </button>
        </div>
      </div>
    </div>
  );
}
