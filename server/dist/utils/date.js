"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDays = addDays;
exports.diffDays = diffDays;
function addDays(d, days) {
    const d2 = new Date(d);
    d2.setDate(d2.getDate() + days);
    return d2;
}
function diffDays(a, b) {
    return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}
