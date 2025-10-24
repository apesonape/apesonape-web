(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["chunks/[root of the server]__1666b6._.js", {

"[externals]/node:async_hooks [external] (node:async_hooks, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}}),
"[externals]/node:buffer [external] (node:buffer, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:buffer", () => require("node:buffer"));

module.exports = mod;
}}),
"[project]/app/api/me/tokens/route.ts [app-edge-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "GET": (()=>GET),
    "revalidate": (()=>revalidate),
    "runtime": (()=>runtime)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/next/dist/esm/api/server.js [app-edge-route] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/esm/server/web/spec-extension/response.js [app-edge-route] (ecmascript)");
;
const ME_API_BASE = process.env.ME_API_BASE || 'https://api-mainnet.magiceden.dev/v2';
const COLLECTION_ADDRESS = ("TURBOPACK compile-time value", "0xa6bAbE18F2318D2880DD7dA3126C19536048F8B0") || '0xa6bAbE18F2318D2880DD7dA3126C19536048F8B0';
const runtime = 'edge';
const revalidate = 60; // Cache for 60 seconds
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') || '32';
        const offset = searchParams.get('offset') || '0';
        const random = searchParams.get('random') === 'true';
        // For Apechain, we need to use the correct API endpoint
        const apiUrl = `${ME_API_BASE}/apechain/collections/${COLLECTION_ADDRESS}/tokens?limit=${limit}&offset=${offset}`;
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json'
            },
            next: {
                revalidate: 60
            }
        });
        if (!response.ok) {
            console.error('Magic Eden API error:', response.statusText);
            // Return mock data as fallback
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                tokens: generateMockTokens(parseInt(limit)),
                total: 1000
            });
        }
        const data = await response.json();
        // If random is requested, shuffle the tokens
        let tokens = data.tokens || data;
        if (random && Array.isArray(tokens)) {
            tokens = tokens.sort(()=>Math.random() - 0.5);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            tokens,
            total: data.total || tokens.length
        });
    } catch (error) {
        console.error('Error fetching tokens:', error);
        // Return mock data as fallback
        const limit = parseInt(new URL(request.url).searchParams.get('limit') || '32');
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            tokens: generateMockTokens(limit),
            total: 1000
        });
    }
}
function generateMockTokens(count) {
    const traits = [
        {
            name: 'Fur',
            value: 'Golden',
            rarity: 10
        },
        {
            name: 'Fur',
            value: 'Silver',
            rarity: 25
        },
        {
            name: 'Fur',
            value: 'Blue',
            rarity: 50
        },
        {
            name: 'Eyes',
            value: 'Laser',
            rarity: 15
        },
        {
            name: 'Accessory',
            value: 'Crown',
            rarity: 5
        },
        {
            name: 'Accessory',
            value: 'Chain',
            rarity: 15
        },
        {
            name: 'Background',
            value: 'Space',
            rarity: 20
        }
    ];
    return Array.from({
        length: count
    }, (_, i)=>({
            mint: `mock-token-${i + 1}`,
            tokenId: `${i + 1}`,
            name: `Ape On Ape #${i + 1}`,
            image: '/AoA-placeholder-apecoinblue.jpg',
            price: Math.random() * 10 + 0.1,
            currency: 'APE',
            rarity: Math.floor(Math.random() * 1000) + 1,
            attributes: traits.sort(()=>Math.random() - 0.5).slice(0, Math.floor(Math.random() * 4) + 2),
            owner: `0x${Math.random().toString(16).substr(2, 40)}`
        }));
}
}}),
"[project]/.next-internal/server/app/api/me/tokens/route/actions.js [app-edge-rsc] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
}}),
}]);

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__1666b6._.js.map