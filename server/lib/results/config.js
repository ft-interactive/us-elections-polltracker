export default function processConfigSheet(rows) {
  // TODO: process data types?
  // TODO: convert markdown here so client doesn't have to
  return (rows || []).reduce((map, row) => {
    if (!row.key) return map;
    map[row.key] = row.value;
    return map;
  }, {});
}
