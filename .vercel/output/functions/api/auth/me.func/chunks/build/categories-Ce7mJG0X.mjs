globalThis.__timing__.logStart('Load chunks/build/categories-Ce7mJG0X');import { u as useFetch } from '../virtual/entry.mjs';
import { _ as _sfc_main } from './Icon-1cxOBUbV.mjs';
import { S as Select_default } from './Select-mj3Sw9q1.mjs';
import { L as LoadingState_default } from './LoadingState-BO66Wa2p.mjs';
import { defineComponent, reactive, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
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

//#region app/pages/categories/index.vue?vue&type=script&setup=true&lang.ts
var index_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "index",
	__ssrInlineRender: true,
	setup(__props) {
		const { data, pending, refresh } = useFetch("/api/categories", {
			credentials: "include",
			lazy: true
		}, "$MYmfmyqlk9");
		const form = reactive({
			name: "",
			type: "expense",
			icon: "circle"
		});
		const error = ref("");
		const success = ref("");
		const categoryTypes = [{
			value: "expense",
			label: "هزینه"
		}, {
			value: "income",
			label: "درآمد"
		}];
		const iconOptions = [
			{
				value: "wallet",
				label: "حقوق",
				icon: "i-lucide-wallet"
			},
			{
				value: "gift",
				label: "هدیه",
				icon: "i-lucide-gift"
			},
			{
				value: "utensils",
				label: "خوراک",
				icon: "i-lucide-utensils"
			},
			{
				value: "car",
				label: "رفت و آمد",
				icon: "i-lucide-car"
			},
			{
				value: "shopping-bag",
				label: "خرید",
				icon: "i-lucide-shopping-bag"
			},
			{
				value: "receipt",
				label: "قبوض",
				icon: "i-lucide-receipt"
			},
			{
				value: "music",
				label: "سرگرمی",
				icon: "i-lucide-music"
			},
			{
				value: "home",
				label: "خانه",
				icon: "i-lucide-house"
			},
			{
				value: "heart-pulse",
				label: "سلامت",
				icon: "i-lucide-heart-pulse"
			},
			{
				value: "graduation-cap",
				label: "آموزش",
				icon: "i-lucide-graduation-cap"
			},
			{
				value: "plane",
				label: "سفر",
				icon: "i-lucide-plane"
			},
			{
				value: "briefcase-business",
				label: "کار",
				icon: "i-lucide-briefcase-business"
			},
			{
				value: "piggy-bank",
				label: "پس‌انداز",
				icon: "i-lucide-piggy-bank"
			},
			{
				value: "chart-no-axes-combined",
				label: "سرمایه",
				icon: "i-lucide-chart-no-axes-combined"
			},
			{
				value: "circle",
				label: "سایر",
				icon: "i-lucide-circle"
			}
		];
		function iconName(value) {
			return iconOptions.find((option) => option.value === value)?.icon ?? "i-lucide-circle";
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_SharedSelect = Select_default;
			const _component_UIcon = _sfc_main;
			const _component_SharedLoadingState = LoadingState_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))}><div><p class="text-sm font-semibold text-slate-500">برای گزارش‌های دقیق‌تر</p><h1 class="text-2xl font-black text-slate-950">دسته‌بندی‌ها</h1></div><form class="mobile-card p-4"><h2 class="text-lg font-bold">دسته‌بندی جدید</h2><div class="mt-4 grid gap-3 sm:grid-cols-2"><label class="block"><span class="text-sm font-medium">نام</span><input${ssrRenderAttr("value", unref(form).name)} class="field mt-2" placeholder="مثلاً خوراک" required></label><label class="block"><span class="text-sm font-medium">نوع</span>`);
			_push(ssrRenderComponent(_component_SharedSelect, {
				modelValue: unref(form).type,
				"onUpdate:modelValue": ($event) => unref(form).type = $event,
				options: categoryTypes,
				class: "mt-2"
			}, null, _parent));
			_push(`</label></div><div class="mt-4"><div class="mb-2 flex items-center justify-between gap-3"><span class="text-sm font-medium">آیکن</span><span class="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">`);
			_push(ssrRenderComponent(_component_UIcon, {
				name: iconName(unref(form).icon),
				class: "size-4"
			}, null, _parent));
			_push(` ${ssrInterpolate(iconOptions.find((option) => option.value === unref(form).icon)?.label)}</span></div><div class="grid grid-cols-3 gap-2 sm:grid-cols-5"><!--[-->`);
			ssrRenderList(iconOptions, (option) => {
				_push(`<button type="button" class="${ssrRenderClass([{ "is-selected": unref(form).icon === option.value }, "icon-choice"])}">`);
				_push(ssrRenderComponent(_component_UIcon, {
					name: option.icon,
					class: "size-5"
				}, null, _parent));
				_push(`<span>${ssrInterpolate(option.label)}</span></button>`);
			});
			_push(`<!--]--></div></div>`);
			if (unref(error)) _push(`<p class="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">${ssrInterpolate(unref(error))}</p>`);
			else _push(`<!---->`);
			if (unref(success)) _push(`<p class="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">${ssrInterpolate(unref(success))}</p>`);
			else _push(`<!---->`);
			_push(`<button class="btn-primary mt-4 w-full sm:w-auto">`);
			_push(ssrRenderComponent(_component_UIcon, {
				name: "i-lucide-plus",
				class: "btn-icon"
			}, null, _parent));
			_push(`<span>افزودن</span></button></form>`);
			if (unref(pending)) _push(ssrRenderComponent(_component_SharedLoadingState, { title: "در حال دریافت دسته‌بندی‌ها" }, null, _parent));
			else {
				_push(`<section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
				ssrRenderList(unref(data)?.categories, (category) => {
					_push(`<article class="mobile-card flex min-h-20 items-center justify-between gap-3 p-4"><div class="min-w-0"><h2 class="truncate font-bold">${ssrInterpolate(category.name)}</h2><p class="mt-1 flex items-center gap-2 text-sm text-slate-500">`);
					_push(ssrRenderComponent(_component_UIcon, {
						name: iconName(category.icon),
						class: "size-4 text-teal-700"
					}, null, _parent));
					_push(`<span>${ssrInterpolate(category.type === "income" ? "درآمد" : "هزینه")}</span></p></div><button class="icon-danger-button" type="button" aria-label="حذف دسته‌بندی" title="حذف دسته‌بندی">`);
					_push(ssrRenderComponent(_component_UIcon, {
						name: "i-lucide-trash-2",
						class: "size-4"
					}, null, _parent));
					_push(`</button></article>`);
				});
				_push(`<!--]-->`);
				if (!unref(data)?.categories?.length) _push(`<p class="mobile-card p-8 text-center text-sm text-slate-500 sm:col-span-2 lg:col-span-3">دسته‌بندی‌ای ثبت نشده است.</p>`);
				else _push(`<!---->`);
				_push(`</section>`);
			}
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/pages/categories/index.vue
var _sfc_setup = index_vue_vue_type_script_setup_true_lang_default.setup;
index_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/categories/index.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var categories_default = index_vue_vue_type_script_setup_true_lang_default;

export { categories_default as default };;globalThis.__timing__.logEnd('Load chunks/build/categories-Ce7mJG0X');
//# sourceMappingURL=categories-Ce7mJG0X.mjs.map
