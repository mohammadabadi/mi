globalThis.__timing__.logStart('Load chunks/_/serializers');function serializeRow(row) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, typeof value === "bigint" ? value.toString() : value])
  );
}
function serializeRows(rows) {
  return rows.map((row) => serializeRow(row));
}

export { serializeRows as a, serializeRow as s };;globalThis.__timing__.logEnd('Load chunks/_/serializers');
//# sourceMappingURL=serializers.mjs.map
