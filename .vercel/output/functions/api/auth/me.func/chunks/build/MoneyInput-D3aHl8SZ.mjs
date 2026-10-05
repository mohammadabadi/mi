globalThis.__timing__.logStart('Load chunks/build/MoneyInput-D3aHl8SZ');import { u as usePersian } from './usePersian-C5t6sT6J.mjs';
import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';

//#region app/components/shared/MoneyInput.vue?vue&type=script&setup=true&lang.ts
var MoneyInput_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "MoneyInput",
	__ssrInlineRender: true,
	props: {
		modelValue: {},
		id: {},
		label: { default: "مبلغ" },
		placeholder: { default: "0" },
		currency: { default: "IRR" },
		required: {
			type: Boolean,
			default: false
		}
	},
	emits: ["update:modelValue"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const { inputAmount } = usePersian();
		const displayValue = computed(() => inputAmount(props.modelValue));
		const unit = computed(() => props.currency === "IRR" ? "ریال" : props.currency);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<label${ssrRenderAttrs(mergeProps({ class: "block" }, _attrs))}><span class="text-sm font-semibold text-slate-700">${ssrInterpolate(__props.label)}</span><span class="amount-field mt-2 block"><input${ssrRenderAttr("id", __props.id)}${ssrRenderAttr("value", unref(displayValue))} inputmode="numeric" autocomplete="off" class="field amount-input"${ssrRenderAttr("placeholder", __props.placeholder)}${ssrIncludeBooleanAttr(__props.required) ? " required" : ""}><span class="amount-unit">${ssrInterpolate(unref(unit))}</span></span></label>`);
		};
	}
});
//#endregion
//#region app/components/shared/MoneyInput.vue
var _sfc_setup = MoneyInput_vue_vue_type_script_setup_true_lang_default.setup;
MoneyInput_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/shared/MoneyInput.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var MoneyInput_default = Object.assign(MoneyInput_vue_vue_type_script_setup_true_lang_default, { __name: "SharedMoneyInput" });

export { MoneyInput_default as M };;globalThis.__timing__.logEnd('Load chunks/build/MoneyInput-D3aHl8SZ');
//# sourceMappingURL=MoneyInput-D3aHl8SZ.mjs.map
