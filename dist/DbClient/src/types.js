"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pageColorMap = void 0;
exports.getPageColorFromHex = getPageColorFromHex;
// This is just a random comment do that git understands there's an update
// Map of page color names to hex values
exports.pageColorMap = {
    LAVENDER: "#A47BB9",
    CORAL: "#E08D79",
    TEAL: "#5C9EAD",
    WARMPINK: "#D46BA3",
    BLUE: "#779ECB",
    PURPLE: "#8859A3"
};
// Map color hex values to PageColor enum
function getPageColorFromHex(hex) {
    const entries = Object.entries(exports.pageColorMap);
    for (const [key, value] of entries) {
        if (value.toLowerCase() === hex.toLowerCase()) {
            return key;
        }
    }
    return "LAVENDER"; // Default
}
//# sourceMappingURL=types.js.map