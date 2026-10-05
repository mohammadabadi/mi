globalThis.__timing__.logStart('Load chunks/build/register-Ds7R9JGB');import { N as NuxtLink } from './nuxt-link-EM4aj9FS.mjs';
import { _ as _sfc_main } from './Icon-1cxOBUbV.mjs';
import { defineComponent, reactive, ref, mergeProps, unref, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderComponent } from 'vue/server-renderer';
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

//#region app/pages/register.vue?vue&type=script&setup=true&lang.ts
var register_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "register",
	__ssrInlineRender: true,
	setup(__props) {
		const form = reactive({
			name: "",
			email: "",
			password: ""
		});
		const error = ref("");
		const loading = ref(false);
		return (_ctx, _push, _parent, _attrs) => {
			const _component_UIcon = _sfc_main;
			const _component_NuxtLink = NuxtLink;
			_push(`<section${ssrRenderAttrs(mergeProps({ class: "flex min-h-[calc(100dvh-96px)] items-center justify-center py-6" }, _attrs))}><form class="mobile-card w-full max-w-md p-5 sm:p-6"><p class="text-sm font-semibold text-slate-500">شروع مدیریت مالی</p><h1 class="mt-1 text-2xl font-black text-slate-950">ساخت حساب</h1><label class="mt-6 block"><span class="text-sm font-medium">نام</span><input${ssrRenderAttr("value", unref(form).name)} class="field mt-2" autocomplete="name" required></label><label class="mt-4 block"><span class="text-sm font-medium">ایمیل</span><input${ssrRenderAttr("value", unref(form).email)} type="email" class="field ltr mt-2" autocomplete="email" required></label><label class="mt-4 block"><span class="text-sm font-medium">رمز عبور</span><input${ssrRenderAttr("value", unref(form).password)} type="password" class="field ltr mt-2" autocomplete="new-password" required minlength="8"></label>`);
			if (unref(error)) _push(`<p class="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">${ssrInterpolate(unref(error))}</p>`);
			else _push(`<!---->`);
			_push(`<button class="btn-primary mt-6 w-full disabled:opacity-60"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""}>`);
			_push(ssrRenderComponent(_component_UIcon, {
				name: unref(loading) ? "i-lucide-loader-circle" : "i-lucide-user-plus",
				class: ["btn-icon", { "animate-spin": unref(loading) }]
			}, null, _parent));
			_push(`<span>${ssrInterpolate(unref(loading) ? "در حال ساخت..." : "ساخت حساب")}</span></button>`);
			_push(ssrRenderComponent(_component_NuxtLink, {
				to: "/login",
				class: "mt-4 flex min-h-12 items-center justify-center gap-2 text-center text-sm font-semibold text-slate-600"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_component_UIcon, {
							name: "i-lucide-log-in",
							class: "size-4"
						}, null, _parent, _scopeId));
						_push(`<span${_scopeId}>قبلاً ثبت‌نام کرده‌اید؟ ورود</span>`);
					} else return [createVNode(_component_UIcon, {
						name: "i-lucide-log-in",
						class: "size-4"
					}), createVNode("span", null, "قبلاً ثبت‌نام کرده‌اید؟ ورود")];
				}),
				_: 1
			}, _parent));
			_push(`</form></section>`);
		};
	}
});
//#endregion
//#region app/pages/register.vue
var _sfc_setup = register_vue_vue_type_script_setup_true_lang_default.setup;
register_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/register.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var register_default = register_vue_vue_type_script_setup_true_lang_default;

export { register_default as default };;globalThis.__timing__.logEnd('Load chunks/build/register-Ds7R9JGB');
//# sourceMappingURL=register-Ds7R9JGB.mjs.map
