import idMixin from '../../mixins/id';
import formMixin from '../../mixins/form';
import formSizeMixin from '../../mixins/form-size';
import formStateMixin from '../../mixins/form-state';
import { arrayIncludes } from '../../utils/array';

// Import styles
import './form-input.css';

// Valid supported input types
var TYPES = ['text', 'password', 'email', 'number', 'url', 'tel', 'search', 'range', 'color', 'date', 'time', 'datetime', 'datetime-local', 'month', 'week'];

export default {
  mixins: [idMixin, formMixin, formSizeMixin, formStateMixin],
  render: function render(h) {
    return h('input', {
      ref: 'input',
      class: this.inputClass,
      attrs: {
        id: this.safeId(),
        name: this.name,
        type: this.localType,
        disabled: this.disabled,
        required: this.required,
        readonly: this.readonly || this.plaintext,
        placeholder: this.placeholder,
        autocomplete: this.autocomplete || null,
        'aria-required': this.required ? 'true' : null,
        'aria-invalid': this.computedAriaInvalid,
        value: this.value
      },
      on: {
        input: this.onInput,
        change: this.onChange
      }
    });
  },

  props: {
    value: {
      default: null
    },
    type: {
      type: String,
      default: 'text',
      validator: function validator(type) {
        return arrayIncludes(TYPES, type);
      }
    },
    ariaInvalid: {
      type: [Boolean, String],
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    plaintext: {
      type: Boolean,
      default: false
    },
    autocomplete: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: null
    },
    formatter: {
      type: Function
    },
    lazyFormatter: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    localType: function localType() {
      // We only allow certain types
      return arrayIncludes(TYPES, this.type) ? this.type : 'text';
    },
    inputClass: function inputClass() {
      return [this.plaintext ? 'form-control-plaintext' : 'form-control', this.sizeFormClass, this.stateClass];
    },
    computedAriaInvalid: function computedAriaInvalid() {
      if (!this.ariaInvalid || this.ariaInvalid === 'false') {
        // this.ariaInvalid is null or false or 'false'
        return this.computedState === false ? 'true' : null;
      }
      if (this.ariaInvalid === true) {
        // User wants explicit aria-invalid=true
        return 'true';
      }
      // Most likely a string value (which could be 'true')
      return this.ariaInvalid;
    }
  },
  mounted: function mounted() {
    if (this.value) {
      var fValue = this.format(this.value, null);
      this.setValue(fValue);
    }
  },

  watch: {
    value: function value(newVal) {
      if (this.lazyFormatter) {
        this.setValue(newVal);
      } else {
        var fValue = this.format(newVal, null);
        this.setValue(fValue);
      }
    }
  },
  methods: {
    format: function format(value, e) {
      if (this.formatter) {
        return this.formatter(value, e);
      }
      return value;
    },
    setValue: function setValue(value) {
      this.$emit('input', value);
      // When formatter removes last typed character, value of text input should update to formatted value
      this.$refs.input.value = value;
    },
    onInput: function onInput(evt) {
      var value = evt.target.value;

      if (this.lazyFormatter) {
        this.setValue(value);
      } else {
        var fValue = this.format(value, evt);
        this.setValue(fValue);
      }
    },
    onChange: function onChange(evt) {
      var fValue = this.format(evt.target.value, evt);
      this.setValue(fValue);
      this.$emit('change', fValue);
    },
    focus: function focus() {
      if (!this.disabled) {
        this.$el.focus();
      }
    }
  }
};