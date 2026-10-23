/* Datos personalizados — @gatm_2210 */
(function(){
  const overrides = {};
  window.SITE_CONFIG = window.SITE_CONFIG || {};
  for (const [path, value] of Object.entries(overrides)) {
    const parts = path.split("."); let obj = window.SITE_CONFIG;
    for (const key of parts.slice(0,-1)) { if (!obj[key] || typeof obj[key] !== "object") obj[key] = {}; obj = obj[key]; }
    obj[parts[parts.length-1]] = value;
  }
})();
