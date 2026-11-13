const STORAGE_KEY = "strength-session-equipment";

const state = {
  regionId: null,
  groupIds: [],
  equipment: loadEquipment(),
  today: [],
};

const figures = document.querySelector(".figures");
const viewSwitch = document.querySelector(".view-switch");
const SNAP_CSS_PX = 14;
const TINT = {
  selected: [236, 92, 62],
  edge: [96, 30, 22],
  region: [250, 196, 178],
  hover: [252, 222, 208],
};
const maps = [...document.querySelectorAll(".body-map")].map(setupMap);
let hoverGroupId = null;

function loadEquipment() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!Array.isArray(raw)) return new Set();
    const known = new Set(SESSION.equipment.map((item) => item.id));
    return new Set(raw.filter((id) => known.has(id)));
  } catch {
    return new Set();
  }
}

function saveEquipment() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.equipment]));
}

function groupById(id) {
  return SESSION.groups.find((group) => group.id === id);
}

function regionById(id) {
  return SESSION.regions.find((region) => region.id === id);
}

function equipmentName(id) {
  return SESSION.equipment.find((item) => item.id === id)?.name || id;
}

function movementById(id) {
  return SESSION.movements.find((movement) => movement.id === id);
}

function el(tag, attrs, children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (key === "class") node.className = value;
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (value != null) node.setAttribute(key, value);
  }
  for (const child of children || []) {
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

function clear(node) {
  node.replaceChildren();
}

function decodeRuns(encoded, size) {
  const cells = new Uint8Array(size);
  let at = 0;
  for (const run of encoded.split(".")) {
    const length = parseInt(run.slice(1), 36);
    cells.fill(parseInt(run[0], 36), at, at + length);
    at += length;
  }
  return cells;
}

function setupMap(host) {
  const view = host.dataset.view;
  const mask = FIGURE_MASKS[view];
  const canvas = host.querySelector("canvas");
  canvas.width = mask.w;
  canvas.height = mask.h;
  for (const [groupId, [left, top]] of Object.entries(mask.hotspots)) {
    host.append(el("button", {
      type: "button",
      class: "muscle hotspot",
      "data-group": groupId,
      style: `left:${left}%;top:${top}%`,
    }));
  }
  return {
    view,
    host,
    canvas,
    context: canvas.getContext("2d"),
    image: new ImageData(mask.w, mask.h),
    w: mask.w,
    h: mask.h,
    ids: mask.ids,
    cells: decodeRuns(mask.runs, mask.w * mask.h),
  };
}

function groupAt(map, clientX, clientY) {
  const box = map.canvas.getBoundingClientRect();
  const scale = map.w / box.width;
  const x = Math.floor((clientX - box.left) * scale);
  const y = Math.floor((clientY - box.top) * scale);
  if (x < 0 || y < 0 || x >= map.w || y >= map.h) return null;
  const hit = map.cells[y * map.w + x];
  if (hit >= 2) return map.ids[hit - 2];
  const radius = Math.round(SNAP_CSS_PX * scale);
  let best = null;
  let bestDistance = radius * radius + 1;
  for (let dy = -radius; dy <= radius; dy++) {
    const row = y + dy;
    if (row < 0 || row >= map.h) continue;
    for (let dx = -radius; dx <= radius; dx++) {
      const col = x + dx;
      if (col < 0 || col >= map.w) continue;
      const code = map.cells[row * map.w + col];
      const distance = dx * dx + dy * dy;
      if (code >= 2 && distance < bestDistance) {
        best = code;
        bestDistance = distance;
      }
    }
  }
  return best ? map.ids[best - 2] : null;
}

function paintMap(map) {
  const tints = new Array(map.ids.length + 2).fill(null);
  map.ids.forEach((id, index) => {
    const group = groupById(id);
    if (state.groupIds.includes(id)) tints[index + 2] = TINT.selected;
    else if (state.regionId && group?.region === state.regionId) tints[index + 2] = TINT.region;
    else if (id === hoverGroupId) tints[index + 2] = TINT.hover;
  });
  const selectedCodes = new Set(
    state.groupIds.map((id) => map.ids.indexOf(id)).filter((index) => index >= 0).map((index) => index + 2),
  );
  const { cells, w, h } = map;
  const data = map.image.data;
  data.fill(0);
  for (let i = 0; i < cells.length; i++) {
    const code = cells[i];
    const tint = tints[code];
    if (!tint) continue;
    let color = tint;
    if (selectedCodes.has(code)) {
      const x = i % w;
      const y = (i - x) / w;
      const edge = x === 0 || y === 0 || x === w - 1 || y === h - 1
        || cells[i - 1] !== code || cells[i + 1] !== code || cells[i - w] !== code || cells[i + w] !== code;
      if (edge) color = TINT.edge;
    }
    const o = i * 4;
    data[o] = color[0];
    data[o + 1] = color[1];
    data[o + 2] = color[2];
    data[o + 3] = 255;
  }
  map.context.putImageData(map.image, 0, 0);
}

function setHover(groupId) {
  if (groupId === hoverGroupId) return;
  hoverGroupId = groupId;
  maps.forEach(paintMap);
}

function labelMuscles() {
  for (const muscle of document.querySelectorAll(".muscle")) {
    const group = groupById(muscle.dataset.group);
    if (!group) continue;
    muscle.setAttribute("role", "button");
    muscle.setAttribute("tabindex", "0");
    muscle.setAttribute("aria-label", group.name);
    muscle.setAttribute("aria-pressed", "false");
  }
}

function paintFigure() {
  for (const muscle of document.querySelectorAll(".muscle")) {
    const group = groupById(muscle.dataset.group);
    const selected = state.groupIds.includes(muscle.dataset.group);
    const inRegion = Boolean(state.regionId && group && group.region === state.regionId && !selected);
    muscle.classList.toggle("is-selected", selected);
    muscle.classList.toggle("is-region", inRegion);
    muscle.setAttribute("aria-pressed", selected ? "true" : "false");
  }
  maps.forEach(paintMap);
}

function ensureVisible(group) {
  if (!group || window.matchMedia("(min-width: 861px)").matches) return;
  const showing = figures.dataset.showing;
  if (group.views.includes(showing)) return;
  figures.dataset.showing = group.views[0];
  syncViewSwitch();
}

function syncViewSwitch() {
  const showing = figures.dataset.showing;
  for (const button of viewSwitch.querySelectorAll("button")) {
    button.setAttribute("aria-pressed", button.dataset.show === showing ? "true" : "false");
  }
}

function selectRegion(regionId) {
  state.regionId = regionId;
  paint();
}

function selectGroup(groupId) {
  const group = groupById(groupId);
  if (!group) return;
  const at = state.groupIds.indexOf(group.id);
  if (at >= 0) {
    state.groupIds.splice(at, 1);
  } else {
    state.groupIds.push(group.id);
    state.regionId = group.region;
    ensureVisible(group);
  }
  paint();
}

function selectedGroups() {
  return state.groupIds.map(groupById).filter(Boolean);
}

function listNames(groups) {
  const names = groups.map((group) => group.name);
  if (names.length < 2) return names[0] || "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
}

function gearOk(movement) {
  return movement.equipment.every((id) => state.equipment.has(id));
}

// Each movement lands once: under its main muscle when that muscle is selected,
// otherwise under the earliest selected muscle it also trains.
function movementSections() {
  const available = SESSION.movements.filter(gearOk);
  const claimed = new Set();
  const take = (id, match) => {
    const items = available
      .filter((movement) => !claimed.has(movement.id) && match(movement))
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const movement of items) claimed.add(movement.id);
    return items;
  };
  const primary = new Map(state.groupIds.map((id) => [id, take(id, (movement) => movement.primary === id)]));
  const extra = new Map(state.groupIds.map((id) => [id, take(id, (movement) => movement.also.includes(id))]));
  return state.groupIds.map((id) => ({
    group: groupById(id),
    primary: primary.get(id),
    extra: extra.get(id),
  }));
}

function todayMovements() {
  return state.today.map(movementById).filter(Boolean);
}

function warmupContext() {
  const groups = selectedGroups();
  if (!groups.length) return null;
  return {
    title: groups.length === 1 ? `Warm-up for ${groups[0].name.toLowerCase()}` : "Warm-up for this session",
    groups,
    movements: todayMovements(),
  };
}

function rankedPreps(groupIds, patterns) {
  return SESSION.warmups
    .filter((item) => !item.any)
    .map((item) => {
      const groupHit = item.groups?.some((id) => groupIds.includes(id)) || false;
      const patternHit = item.patterns?.some((pattern) => patterns.includes(pattern)) || false;
      if (item.groups?.length && !groupHit) return { item, score: 0 };
      let score = 0;
      if (patternHit) score += 1;
      if (groupHit) score += 2;
      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .map((entry) => entry.item);
}

function warmupSteps(context) {
  const heat = SESSION.warmups.find((item) => item.any);
  let preps;
  if (context.groups.length === 1) {
    preps = rankedPreps(context.groups.map((group) => group.id), context.groups.map((group) => group.pattern)).slice(0, 2);
  } else {
    // One best prep per selected muscle, so the warm-up covers the whole session.
    const seen = new Set();
    preps = [];
    for (const group of context.groups) {
      const best = rankedPreps([group.id], [group.pattern])[0];
      if (!best || seen.has(best.id)) continue;
      seen.add(best.id);
      preps.push(best);
    }
  }

  const steps = [heat, ...preps].filter(Boolean);
  if (context.movements.length === 1) {
    const movement = context.movements[0];
    const gear = movement.equipment.map(equipmentName).join(" and ");
    steps.push({
      name: "Easy ramp",
      how: `Two easy sets of ${movement.name}, using the ${gear}. Stop well short of the weight you came to lift.`,
    });
  } else if (context.movements.length > 1) {
    const names = context.movements.map((movement) => movement.name).join(", ");
    steps.push({
      name: "Easy ramp",
      how: `Before the working sets, do one light set of each: ${names}.`,
    });
  }
  return steps;
}

function renderSelection() {
  const title = document.querySelector("#selection-title");
  const note = document.querySelector("#selection-note");
  const groups = selectedGroups();
  const region = regionById(state.regionId);
  if (groups.length === 1) {
    title.textContent = groups[0].name;
    note.textContent = "Movements that train it, using the equipment you checked. Tap it again to take it off.";
  } else if (groups.length > 1) {
    title.textContent = listNames(groups);
    note.textContent = "Movements and a warm-up for all of these. Tap a muscle again to take it off.";
  } else if (region) {
    title.textContent = region.name;
    note.textContent = "Choose the groups you want in this session.";
  } else {
    title.textContent = "Choose muscles";
    note.textContent = "Tap the muscles for this session, or start with a region. Three or four is a full session.";
  }
}

function renderSession() {
  const host = document.querySelector("#session");
  clear(host);
  const groups = selectedGroups();
  if (!groups.length) {
    host.hidden = true;
    return;
  }
  host.hidden = false;
  host.append(el("p", { class: "hint" }, ["This session"]));
  host.append(el("div", { class: "chip-row", role: "group", "aria-label": "Selected muscles" }, groups.map((group) =>
    el("button", {
      type: "button",
      class: "chip",
      "aria-pressed": "true",
      onclick: () => selectGroup(group.id),
    }, [group.name]),
  )));
}

function renderRegions() {
  const host = document.querySelector("#regions");
  clear(host);
  host.append(
    el("div", { class: "chip-row", role: "group", "aria-label": "Regions" }, SESSION.regions.map((region) =>
      el("button", {
        type: "button",
        class: "chip",
        "aria-pressed": state.regionId === region.id ? "true" : "false",
        onclick: () => selectRegion(region.id),
      }, [region.name]),
    )),
  );
}

function renderGroups() {
  const host = document.querySelector("#groups");
  clear(host);
  const region = regionById(state.regionId);
  if (!region) {
    host.hidden = true;
    return;
  }
  host.hidden = false;
  host.append(
    el("div", { class: "chip-row", role: "group", "aria-label": `${region.name} groups` }, region.groups.map((id) => {
      const group = groupById(id);
      return el("button", {
        type: "button",
        class: "chip",
        "aria-pressed": state.groupIds.includes(id) ? "true" : "false",
        onclick: () => selectGroup(id),
      }, [group.name]);
    })),
  );
}

function renderEquipment() {
  const host = document.querySelector("#equipment");
  clear(host);
  host.append(el("legend", {}, ["Equipment you can use"]));
  host.append(el("p", { class: "hint" }, ["Checked items stay on this browser. A movement appears only when every piece it needs is checked."]));
  const list = el("div", { class: "checks" }, SESSION.equipment.map((item) => {
    const input = el("input", { type: "checkbox", id: `eq-${item.id}`, value: item.id });
    input.checked = state.equipment.has(item.id);
    input.addEventListener("change", () => {
      if (input.checked) state.equipment.add(item.id);
      else state.equipment.delete(item.id);
      saveEquipment();
      renderMovements();
      renderWarmup();
    });
    return el("label", { class: "check", for: `eq-${item.id}` }, [input, el("span", {}, [item.name])]);
  }));
  host.append(list);
}

function renderMovements() {
  const host = document.querySelector("#movements");
  clear(host);
  host.append(el("h2", {}, ["Movements"]));
  const several = state.groupIds.length > 1;
  if (!state.groupIds.length) {
    host.append(el("p", { class: "empty" }, ["Choose a muscle group to see movements."]));
    return;
  }
  if (state.equipment.size === 0) {
    host.append(el("p", { class: "empty" }, [`Check the equipment you can use. Movements for ${several ? "these muscles" : "this muscle"} show up after that.`]));
    return;
  }
  const sections = movementSections();
  if (sections.every((section) => !section.primary.length && !section.extra.length)) {
    host.append(el("p", { class: "empty" }, [`Nothing for ${several ? "these muscles" : "this muscle"} uses only the equipment you checked. Add a piece, or pick another muscle.`]));
    return;
  }
  for (const section of sections) {
    if (several) host.append(el("p", { class: "group-label" }, [section.group.name]));
    const movements = [...section.primary, ...section.extra];
    if (!movements.length) {
      host.append(el("p", { class: "empty" }, ["Nothing with the equipment you checked."]));
      continue;
    }
    const list = el("div", { class: "cards" });
    for (const movement of movements) list.append(movementCard(movement));
    host.append(list);
  }
}

function movementCard(movement) {
  const added = state.today.includes(movement.id);
  const primary = groupById(movement.primary);
  const also = movement.also.map((id) => groupById(id)?.name).filter(Boolean);
  const gear = movement.equipment.map(equipmentName).join(", ");
  const covers = state.groupIds.length > 1
    ? state.groupIds.filter((id) => movement.primary === id || movement.also.includes(id)).map((id) => groupById(id).name)
    : [];
  return el("article", { class: "card", "data-movement": movement.id }, [
    el("div", { class: "card-top" }, [
      el("h3", {}, [movement.name]),
      el("button", {
        type: "button",
        class: added ? "text-button is-added" : "text-button",
        onclick: () => toggleToday(movement.id),
      }, [added ? "Remove" : "Add to today"]),
    ]),
    el("p", {}, [movement.setup]),
    el("p", { class: "meta" }, [
      covers.length ? `Covers ${covers.join(", ")} · ` : "",
      `Main: ${primary.name}`,
      also.length ? ` · Also: ${also.join(", ")}` : "",
      ` · ${gear}`,
    ]),
  ]);
}

function renderToday() {
  const host = document.querySelector("#today");
  clear(host);
  const chosen = todayMovements();
  host.append(el("h2", {}, [`Today${chosen.length ? ` (${chosen.length})` : ""}`]));
  if (!chosen.length) {
    host.append(el("p", { class: "empty" }, ["Add a movement and it sits here for this visit."]));
    return;
  }
  const list = el("ul", { class: "today-list" });
  for (const movement of chosen) {
    list.append(el("li", {}, [
      el("span", {}, [movement.name]),
      el("button", {
        type: "button",
        class: "text-button",
        onclick: () => toggleToday(movement.id),
      }, ["Remove"]),
    ]));
  }
  host.append(list);
}

function renderWarmup() {
  const host = document.querySelector("#warmup");
  clear(host);
  const context = warmupContext();
  host.append(el("h2", {}, [context ? context.title : "Warm-up"]));
  if (!context) {
    host.append(el("p", { class: "empty" }, ["The warm-up appears once you choose a muscle."]));
    return;
  }
  const steps = warmupSteps(context);
  const list = el("ol", { class: "warmup" });
  for (const step of steps) {
    list.append(el("li", {}, [
      el("strong", {}, [step.name]),
      el("span", {}, [step.how]),
    ]));
  }
  host.append(list);
}

function toggleToday(movementId) {
  if (state.today.includes(movementId)) state.today = state.today.filter((id) => id !== movementId);
  else state.today.push(movementId);
  renderMovements();
  renderToday();
  renderWarmup();
}

function paint() {
  paintFigure();
  renderSelection();
  renderSession();
  renderRegions();
  renderGroups();
  renderMovements();
  renderToday();
  renderWarmup();
}

function bindFigure() {
  for (const muscle of document.querySelectorAll(".muscle")) {
    muscle.addEventListener("click", () => selectGroup(muscle.dataset.group));
    muscle.addEventListener("focus", () => setHover(muscle.dataset.group));
    muscle.addEventListener("blur", () => setHover(null));
  }
  for (const map of maps) {
    map.canvas.addEventListener("click", (event) => {
      const groupId = groupAt(map, event.clientX, event.clientY);
      if (groupId) selectGroup(groupId);
    });
    map.canvas.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      const groupId = groupAt(map, event.clientX, event.clientY);
      map.canvas.style.cursor = groupId ? "pointer" : "";
      setHover(groupId);
    });
    map.canvas.addEventListener("pointerleave", () => setHover(null));
  }
}

function bindViews() {
  viewSwitch.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    figures.dataset.showing = button.dataset.show;
    syncViewSwitch();
  });
}

function reportMissingShapes() {
  for (const group of SESSION.groups) {
    for (const view of group.views) {
      if (!FIGURE_MASKS[view].hotspots[group.id]) console.error("Missing shape for", group.id, "on", view);
    }
  }
  for (const map of maps) {
    for (const id of map.ids) {
      if (!groupById(id)) console.error("Unknown shape", id);
    }
  }
}

labelMuscles();
bindFigure();
bindViews();
renderEquipment();
syncViewSwitch();
paint();
reportMissingShapes();
