globalThis.__timing__.logStart('Load chunks/build/LoadingState-BO66Wa2p');import { _ as _sfc_main } from './Icon-1cxOBUbV.mjs';
import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderStyle } from 'vue/server-renderer';

//#region app/components/shared/LoadingState.vue?vue&type=script&setup=true&lang.ts
var LoadingState_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "LoadingState",
	__ssrInlineRender: true,
	props: {
		title: { default: "در حال دریافت داده‌ها" },
		rows: { default: 3 }
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_UIcon = _sfc_main;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "mobile-card loading-state p-4" }, _attrs))}><div class="flex items-center gap-3"><span class="loading-orbit">`);
			_push(ssrRenderComponent(_component_UIcon, {
				name: "i-lucide-sparkles",
				class: "size-4"
			}, null, _parent));
			_push(`</span><div class="min-w-0"><p class="text-sm font-black text-teal-950">${ssrInterpolate(__props.title)}</p><p class="mt-1 text-xs text-slate-500">چند لحظه صبر کنید</p></div></div><div class="mt-5 space-y-3"><!--[-->`);
			ssrRenderList(__props.rows, (row) => {
				_push(`<div class="loading-row"><span class="loading-dot"></span><span class="loading-line" style="${ssrRenderStyle({ width: `${86 - row * 9}%` })}"></span></div>`);
			});
			_push(`<!--]--></div></div>`);
		};
	}
});
//#endregion
//#region app/components/shared/LoadingState.vue
var _sfc_setup = LoadingState_vue_vue_type_script_setup_true_lang_default.setup;
LoadingState_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/shared/LoadingState.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var LoadingState_default = Object.assign(LoadingState_vue_vue_type_script_setup_true_lang_default, { __name: "SharedLoadingState" });

export { LoadingState_default as L };;globalThis.__timing__.logEnd('Load chunks/build/LoadingState-BO66Wa2p');
//# sourceMappingURL=LoadingState-BO66Wa2p.mjs.map
