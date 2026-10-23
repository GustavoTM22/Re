/* Ediciones de contenido — @gatm_2210 */
(function(){
  const state = {"elements": {"#historia \u003e div \u003e div:nth-of-type(2) \u003e div:nth-of-type(2) \u003e div:nth-of-type(1) \u003e div \u003e svg \u003e text": {"text": "            ..............................Nuestro pequeño milagro.", "attrs": {}}}, "insertions": [], "sectionOrder": []};
  function apply(){
    for(const [selector, item] of Object.entries(state.elements)){
      try { document.querySelectorAll(selector).forEach(el => {
        if(typeof item.text === "string") el.textContent = item.text;
        if(item.attrs && typeof item.attrs === "object") for (const [name,value] of Object.entries(item.attrs)) {
          if (/^(?:href|src|alt|title|target|rel|aria-label|placeholder|id)$/.test(name)) {
            if(value === null || value === "") el.removeAttribute(name); else el.setAttribute(name,String(value));
          }
        }
      }); } catch(e){ console.warn("GATM: selector omitido", selector, e); }
    }
    if(Array.isArray(state.sectionOrder) && state.sectionOrder.length) {
      const main = document.querySelector("main#contenido");
      if(main) for(const id of state.sectionOrder){
        const section = document.getElementById(id);
        if(section && section.parentElement === main) main.appendChild(section);
      }
    }
    for(const entry of state.insertions){
      try { const parent = document.querySelector(entry.parent); if (!parent || document.querySelector("[data-gatm-insert=\""+entry.id+"\"]")) continue;
        const img = document.createElement("img"); img.src = entry.src; img.alt = entry.alt || ""; img.setAttribute("data-gatm-insert",entry.id);
        img.style.cssText = "display:block;max-width:100%;width:"+(entry.width || "100%")+";height:auto;margin:20px auto;border-radius:"+(entry.radius||"14px")+";object-fit:cover";
        parent.appendChild(img);
      }catch(e){console.warn("GATM: no se pudo insertar imagen",e);}
    }
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",apply); else apply();
})();
