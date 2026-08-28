export const getDeviceFingerprint = () => {
  const nav = typeof window !== "undefined" ? window.navigator : {};
  const screen = typeof window !== "undefined" ? window.screen : {};
  
  const components = [
    nav.userAgent || "",
    nav.language || "",
    screen.colorDepth || "",
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset()
  ];
  
  const str = components.join("###");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "fp_" + Math.abs(hash).toString(16);
};
