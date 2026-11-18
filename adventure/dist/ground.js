/* Percentages locate feet on a 16:9 painting. Distances use the same scale on both axes. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CastawayGround = factory();
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const Y = 9 / 16;
  const distance = (a, b) => Math.hypot(a.x - b.x, (a.y - b.y) * Y);
  const mix = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  const cross = (ax, ay, bx, by) => ax * by - ay * bx;

  function nearestEdge(a, b, p) {
    const dx = b.x - a.x, dy = (b.y - a.y) * Y;
    const t = ((p.x - a.x) * dx + (p.y - a.y) * Y * dy) / (dx * dx + dy * dy || 1);
    return mix(a, b, Math.max(0, Math.min(1, t)));
  }
  function contains(polygon, point) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[j], b = polygon[i];
      if (distance(nearestEdge(a, b, point), point) < .00001) return true;
      if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
    }
    return inside;
  }
  function project(polygon, point) {
    if (contains(polygon, point)) return point;
    const edges = polygon.map((a, i) => nearestEdge(a, polygon[(i + 1) % polygon.length], point));
    return edges.reduce((best, p) => distance(p, point) < distance(best, point) ? p : best);
  }
  function canWalk(polygon, a, b) {
    // Test each interval between consecutive boundary crossings, including grazing corners.
    const times = [0, 1], dx = b.x - a.x, dy = b.y - a.y;
    for (let i = 0; i < polygon.length; i++) {
      const c = polygon[i], d = polygon[(i + 1) % polygon.length];
      const ex = d.x - c.x, ey = d.y - c.y, det = cross(dx, dy, ex, ey);
      if (Math.abs(det) < 1e-9) continue;
      const t = cross(c.x - a.x, c.y - a.y, ex, ey) / det;
      const u = cross(c.x - a.x, c.y - a.y, dx, dy) / det;
      if (t > 0 && t < 1 && u >= -1e-8 && u <= 1 + 1e-8) times.push(t);
    }
    times.sort((x, y) => x - y);
    return times.slice(1).every((t, i) => contains(polygon, mix(a, b, (times[i] + t) / 2)));
  }
  function route(polygon, origin, destination) {
    const a = project(polygon, origin), b = project(polygon, destination);
    let points = [a, b];
    if (!canWalk(polygon, a, b)) {
      const nodes = [a, b, ...polygon], costs = nodes.map(() => Infinity), prev = [], done = new Set();
      costs[0] = 0;
      while (done.size < nodes.length) {
        let best = -1;
        for (let i = 0; i < nodes.length; i++) if (!done.has(i) && (best < 0 || costs[i] < costs[best])) best = i;
        if (best === 1 || !Number.isFinite(costs[best])) break;
        done.add(best);
        for (let i = 1; i < nodes.length; i++) {
          if (done.has(i)) continue;
          const cost = costs[best] + distance(nodes[best], nodes[i]);
          if (cost < costs[i] && canWalk(polygon, nodes[best], nodes[i])) { costs[i] = cost; prev[i] = best; }
        }
      }
      points = [b];
      for (let i = 1; prev[i] !== undefined; i = prev[i]) points.unshift(nodes[prev[i]]);
      if (points.length === 1) points = [a];
    }
    const lengths = points.slice(1).map((p, i) => distance(points[i], p));
    return { points, lengths, length: lengths.reduce((sum, n) => sum + n, 0) };
  }
  function sample(path, fraction) {
    let left = Math.max(0, Math.min(1, fraction)) * path.length;
    for (let i = 0; i < path.lengths.length; i++) {
      const length = path.lengths[i];
      if (left <= length) return mix(path.points[i], path.points[i + 1], length ? left / length : 1);
      left -= length;
    }
    return path.points[path.points.length - 1];
  }
  return { distance, contains, project, canWalk, route, sample };
});
