globalThis.__timing__.logStart('Load chunks/build/default-tfczArzH');import { i as useRoute$1, u as useFetch, j as useCookie, C as ClientOnly } from '../virtual/entry.mjs';
import { N as NuxtLink } from './nuxt-link-EM4aj9FS.mjs';
import { _ as _sfc_main } from './Icon-1cxOBUbV.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, withCtx, createVNode, unref, createTextVNode, toDisplayString, shallowRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';
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

//#region app/components/shared/PwaInstallBanner.vue?vue&type=script&setup=true&lang.ts
var PwaInstallBanner_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "PwaInstallBanner",
	__ssrInlineRender: true,
	setup(__props) {
		const deferredPrompt = shallowRef(null);
		const dismissed = useCookie("mifin_install_dismissed", {
			maxAge: 1209600,
			sameSite: "lax"
		});
		computed(() => Boolean(deferredPrompt.value) && dismissed.value !== "1");
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(ClientOnly, _attrs, {}, _parent));
		};
	}
});
//#endregion
//#region app/components/shared/PwaInstallBanner.vue
var _sfc_setup$1 = PwaInstallBanner_vue_vue_type_script_setup_true_lang_default.setup;
PwaInstallBanner_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/shared/PwaInstallBanner.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var PwaInstallBanner_default = Object.assign(PwaInstallBanner_vue_vue_type_script_setup_true_lang_default, { __name: "SharedPwaInstallBanner" });
//#endregion
//#region app/layouts/default.vue?vue&type=script&setup=true&lang.ts
var default_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "default",
	__ssrInlineRender: true,
	async setup(__props) {
		let __temp, __restore;
		const route = useRoute$1();
		const { data: me, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/auth/me", {
			key: "layout-user",
			credentials: "include"
		}, "$q4VGowZ4sp")), __temp = await __temp, __restore(), __temp);
		const user = computed(() => me.value?.user);
		const nav = [
			{
				to: "/dashboard",
				label: "داشبورد",
				short: "خانه",
				icon: "i-lucide-house"
			},
			{
				to: "/accounts",
				label: "حساب‌ها",
				short: "حساب",
				icon: "i-lucide-wallet-cards"
			},
			{
				to: "/transactions",
				label: "تراکنش‌ها",
				short: "ثبت",
				icon: "i-lucide-receipt-text"
			},
			{
				to: "/categories",
				label: "دسته‌بندی‌ها",
				short: "دسته",
				icon: "i-lucide-tags"
			},
			{
				to: "/reports",
				label: "گزارش‌ها",
				short: "گزارش",
				icon: "i-lucide-chart-no-axes-combined"
			}
		];
		function isActive(path) {
			return route.path === path || route.path.startsWith(`${path}/`);
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_NuxtLink = NuxtLink;
			const _component_UIcon = _sfc_main;
			const _component_SharedPwaInstallBanner = PwaInstallBanner_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "app-shell" }, _attrs))}><header class="sticky top-0 z-30 border-b border-teal-900/10 bg-white/90 backdrop-blur"><div class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">`);
			_push(ssrRenderComponent(_component_NuxtLink, {
				to: "/",
				class: "flex min-h-12 items-center gap-2 text-lg font-black text-slate-950",
				"aria-label": "میفین"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="inline-flex size-9 items-center justify-center rounded-xl bg-teal-800 text-sm font-black text-white shadow-sm"${_scopeId}>می</span><span${_scopeId}>میفین</span>`);
					else return [createVNode("span", { class: "inline-flex size-9 items-center justify-center rounded-xl bg-teal-800 text-sm font-black text-white shadow-sm" }, "می"), createVNode("span", null, "میفین")];
				}),
				_: 1
			}, _parent));
			if (unref(user)) {
				_push(`<nav class="hidden items-center gap-1 md:flex"><!--[-->`);
				ssrRenderList(nav, (item) => {
					_push(ssrRenderComponent(_component_NuxtLink, {
						key: item.to,
						to: item.to,
						prefetch: "",
						class: ["nav-item inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-900", { "bg-teal-800 text-white hover:bg-teal-800 hover:text-white": isActive(item.to) }]
					}, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) {
								_push(ssrRenderComponent(_component_UIcon, {
									name: item.icon,
									class: "size-4"
								}, null, _parent, _scopeId));
								_push(` ${ssrInterpolate(item.label)}`);
							} else return [createVNode(_component_UIcon, {
								name: item.icon,
								class: "size-4"
							}, null, 8, ["name"]), createTextVNode(" " + toDisplayString(item.label), 1)];
						}),
						_: 2
					}, _parent));
				});
				_push(`<!--]--></nav>`);
			} else _push(`<!---->`);
			_push(`<div class="flex items-center gap-2 text-sm">`);
			if (unref(user)) _push(`<span class="hidden max-w-32 truncate text-slate-600 sm:inline">${ssrInterpolate(unref(user).name)}</span>`);
			else _push(`<!---->`);
			if (unref(user)) {
				_push(`<button class="btn-secondary min-h-10 px-3 py-2 text-sm">`);
				_push(ssrRenderComponent(_component_UIcon, {
					name: "i-lucide-log-out",
					class: "btn-icon"
				}, null, _parent));
				_push(`<span>خروج</span></button>`);
			} else _push(ssrRenderComponent(_component_NuxtLink, {
				to: "/login",
				class: "btn-primary min-h-10 px-4 py-2 text-sm"
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
			_push(`</div></div></header><main class="app-main">`);
			ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
			_push(`</main>`);
			_push(ssrRenderComponent(_component_SharedPwaInstallBanner, null, null, _parent));
			if (unref(user)) {
				_push(`<nav class="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-teal-900/10 bg-white/95 px-2 pt-2 shadow-[0_-8px_28px_rgb(15_118_110_/_0.12)] backdrop-blur md:hidden" aria-label="ناوبری اصلی"><div class="mx-auto grid max-w-md grid-cols-5 gap-1"><!--[-->`);
				ssrRenderList(nav, (item) => {
					_push(ssrRenderComponent(_component_NuxtLink, {
						key: item.to,
						to: item.to,
						prefetch: "",
						class: ["nav-item flex min-h-14 flex-col items-center justify-center rounded-xl px-1 text-xs font-semibold text-slate-500", { "bg-teal-800 text-white shadow-sm": isActive(item.to) }]
					}, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) {
								_push(ssrRenderComponent(_component_UIcon, {
									name: item.icon,
									class: "nav-icon"
								}, null, _parent, _scopeId));
								_push(`<span${_scopeId}>${ssrInterpolate(item.short)}</span>`);
							} else return [createVNode(_component_UIcon, {
								name: item.icon,
								class: "nav-icon"
							}, null, 8, ["name"]), createVNode("span", null, toDisplayString(item.short), 1)];
						}),
						_: 2
					}, _parent));
				});
				_push(`<!--]--></div></nav>`);
			} else _push(`<!---->`);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/layouts/default.vue
var _sfc_setup = default_vue_vue_type_script_setup_true_lang_default.setup;
default_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var default_default = default_vue_vue_type_script_setup_true_lang_default;

export { default_default as default };;globalThis.__timing__.logEnd('Load chunks/build/default-tfczArzH');
//# sourceMappingURL=default-tfczArzH.mjs.map
