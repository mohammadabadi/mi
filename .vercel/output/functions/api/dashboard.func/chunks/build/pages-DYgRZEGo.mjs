globalThis.__timing__.logStart('Load chunks/build/pages-DYgRZEGo');import { N as NuxtLink } from './nuxt-link-EM4aj9FS.mjs';
import { _ as _sfc_main } from './Icon-1cxOBUbV.mjs';
import { defineComponent, mergeProps, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import '../virtual/entry.mjs';
import 'nostics';
import 'nostics/formatters/ansi';
import 'unhead/utils';
import '../routes/renderer.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@iconify/utils';
import 'consola';
import 'unhead/server';
import 'unhead/legacy';
import 'unhead/plugins';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import 'vue-router';
import '@vue/shared';
import '@iconify/vue';
import 'tailwindcss/colors';
import './components-BoJy0Hie.mjs';
import '@iconify/utils/lib/css/icon';

//#endregion
//#region app/pages/index.vue?vue&type=script&setup=true&lang.ts
var index_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "index",
	__ssrInlineRender: true,
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_NuxtLink = NuxtLink;
			const _component_UIcon = _sfc_main;
			_push(`<section${ssrRenderAttrs(mergeProps({ class: "grid min-h-[calc(100dvh-96px)] items-center gap-8 py-6 lg:grid-cols-[1fr_0.9fr]" }, _attrs))}><div><p class="mb-3 text-sm font-semibold text-teal-700">مدیریت مالی شخصی، دقیق و ساده</p><h1 class="max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl">میفین</h1><p class="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg"> حساب‌ها، درآمدها، هزینه‌ها و انتقال بین حساب‌ها را با مدل مالی درست مدیریت کنید. موجودی از تراکنش‌ها محاسبه می‌شود، نه با یک عدد قابل خراب شدن. </p><div class="mt-7 grid gap-3 sm:flex">`);
			_push(ssrRenderComponent(_component_NuxtLink, {
				to: "/register",
				class: "btn-primary w-full sm:w-auto"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_component_UIcon, {
							name: "i-lucide-user-plus",
							class: "btn-icon"
						}, null, _parent, _scopeId));
						_push(`<span${_scopeId}>شروع کنید</span>`);
					} else return [createVNode(_component_UIcon, {
						name: "i-lucide-user-plus",
						class: "btn-icon"
					}), createVNode("span", null, "شروع کنید")];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_component_NuxtLink, {
				to: "/login",
				class: "btn-secondary w-full sm:w-auto"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_component_UIcon, {
							name: "i-lucide-log-in",
							class: "btn-icon"
						}, null, _parent, _scopeId));
						_push(`<span${_scopeId}>ورود</span>`);
					} else return [createVNode(_component_UIcon, {
						name: "i-lucide-log-in",
						class: "btn-icon"
					}), createVNode("span", null, "ورود")];
				}),
				_: 1
			}, _parent));
			_push(`</div></div><div class="grid gap-3"><div class="finance-hero rounded-xl p-5 text-white"><div class="text-sm text-slate-300">موجودی کل</div><div class="money-value mt-2 text-3xl font-black">۱۲۵٬۴۰۰٬۰۰۰ ریال</div></div><div class="grid grid-cols-2 gap-3"><div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div class="text-sm text-emerald-700">درآمد ماه</div><div class="money-value mt-2 text-lg font-bold text-emerald-900">+۳۵٬۰۰۰٬۰۰۰ ریال</div></div><div class="rounded-xl border border-rose-200 bg-rose-50 p-4"><div class="text-sm text-rose-700">هزینه ماه</div><div class="money-value mt-2 text-lg font-bold text-rose-900">-۱۸٬۵۰۰٬۰۰۰ ریال</div></div></div></div></section>`);
		};
	}
});
//#endregion
//#region app/pages/index.vue
var _sfc_setup = index_vue_vue_type_script_setup_true_lang_default.setup;
index_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var pages_default = index_vue_vue_type_script_setup_true_lang_default;

export { pages_default as default };;globalThis.__timing__.logEnd('Load chunks/build/pages-DYgRZEGo');
//# sourceMappingURL=pages-DYgRZEGo.mjs.map
