import { isString } from './util';
import { Rules } from './rules';
import { validationMessages } from './validation-messages';
/**
 * Part of the fluent rule API. Enables customizing property rules.
 */
var FluentRuleCustomizer = (function () {
    function FluentRuleCustomizer(property, condition, config, fluentEnsure, fluentRules, parser) {
        if (config === void 0) { config = {}; }
        this.fluentEnsure = fluentEnsure;
        this.fluentRules = fluentRules;
        this.parser = parser;
        this.rule = {
            property: property,
            condition: condition,
            config: config,
            when: null,
            messageKey: 'default',
            message: null,
            sequence: fluentRules.sequence
        };
        this.fluentEnsure._addRule(this.rule);
    }
    /**
     * Validate subsequent rules after previously declared rules have
     * been validated successfully. Use to postpone validation of costly
     * rules until less expensive rules pass validation.
     */
    FluentRuleCustomizer.prototype.then = function () {
        this.fluentRules.sequence++;
        return this;
    };
    /**
     * Specifies the key to use when looking up the rule's validation message.
     */
    FluentRuleCustomizer.prototype.withMessageKey = function (key) {
        this.rule.messageKey = key;
        this.rule.message = null;
        return this;
    };
    /**
     * Specifies rule's validation message.
     */
    FluentRuleCustomizer.prototype.withMessage = function (message) {
        this.rule.messageKey = 'custom';
        this.rule.message = this.parser.parseMessage(message);
        return this;
    };
    /**
     * Specifies a condition that must be met before attempting to validate the rule.
     * @param condition A function that accepts the object as a parameter and returns true
     * or false whether the rule should be evaluated.
     */
    FluentRuleCustomizer.prototype.when = function (condition) {
        this.rule.when = condition;
        return this;
    };
    /**
     * Tags the rule instance, enabling the rule to be found easily
     * using ValidationRules.taggedRules(rules, tag)
     */
    FluentRuleCustomizer.prototype.tag = function (tag) {
        this.rule.tag = tag;
        return this;
    };
    ///// FluentEnsure APIs /////
    /**
     * Target a property with validation rules.
     * @param property The property to target. Can be the property name or a property accessor function.
     */
    FluentRuleCustomizer.prototype.ensure = function (subject) {
        return this.fluentEnsure.ensure(subject);
    };
    /**
     * Targets an object with validation rules.
     */
    FluentRuleCustomizer.prototype.ensureObject = function () {
        return this.fluentEnsure.ensureObject();
    };
    Object.defineProperty(FluentRuleCustomizer.prototype, "rules", {
        /**
         * Rules that have been defined using the fluent API.
         */
        get: function () {
            return this.fluentEnsure.rules;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Applies the rules to a class or object, making them discoverable by the StandardValidator.
     * @param target A class or object.
     */
    FluentRuleCustomizer.prototype.on = function (target) {
        return this.fluentEnsure.on(target);
    };
    ///////// FluentRules APIs /////////
    /**
     * Applies an ad-hoc rule function to the ensured property or object.
     * @param condition The function to validate the rule.
     * Will be called with two arguments, the property value and the object.
     * Should return a boolean or a Promise that resolves to a boolean.
     */
    FluentRuleCustomizer.prototype.satisfies = function (condition, config) {
        return this.fluentRules.satisfies(condition, config);
    };
    /**
     * Applies a rule by name.
     * @param name The name of the custom or standard rule.
     * @param args The rule's arguments.
     */
    FluentRuleCustomizer.prototype.satisfiesRule = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return (_a = this.fluentRules).satisfiesRule.apply(_a, [name].concat(args));
        var _a;
    };
    /**
     * Applies the "required" rule to the property.
     * The value cannot be null, undefined or whitespace.
     */
    FluentRuleCustomizer.prototype.required = function () {
        return this.fluentRules.required();
    };
    /**
     * Applies the "matches" rule to the property.
     * Value must match the specified regular expression.
     * null, undefined and empty-string values are considered valid.
     */
    FluentRuleCustomizer.prototype.matches = function (regex) {
        return this.fluentRules.matches(regex);
    };
    /**
     * Applies the "email" rule to the property.
     * null, undefined and empty-string values are considered valid.
     */
    FluentRuleCustomizer.prototype.email = function () {
        return this.fluentRules.email();
    };
    /**
     * Applies the "minLength" STRING validation rule to the property.
     * null, undefined and empty-string values are considered valid.
     */
    FluentRuleCustomizer.prototype.minLength = function (length) {
        return this.fluentRules.minLength(length);
    };
    /**
     * Applies the "maxLength" STRING validation rule to the property.
     * null, undefined and empty-string values are considered valid.
     */
    FluentRuleCustomizer.prototype.maxLength = function (length) {
        return this.fluentRules.maxLength(length);
    };
    /**
     * Applies the "minItems" ARRAY validation rule to the property.
     * null and undefined values are considered valid.
     */
    FluentRuleCustomizer.prototype.minItems = function (count) {
        return this.fluentRules.minItems(count);
    };
    /**
     * Applies the "maxItems" ARRAY validation rule to the property.
     * null and undefined values are considered valid.
     */
    FluentRuleCustomizer.prototype.maxItems = function (count) {
        return this.fluentRules.maxItems(count);
    };
    /**
     * Applies the "equals" validation rule to the property.
     * null, undefined and empty-string values are considered valid.
     */
    FluentRuleCustomizer.prototype.equals = function (expectedValue) {
        return this.fluentRules.equals(expectedValue);
    };
    return FluentRuleCustomizer;
}());
export { FluentRuleCustomizer };
/**
 * Part of the fluent rule API. Enables applying rules to properties and objects.
 */
var FluentRules = (function () {
    function FluentRules(fluentEnsure, parser, property) {
        this.fluentEnsure = fluentEnsure;
        this.parser = parser;
        this.property = property;
        /**
         * Current rule sequence number. Used to postpone evaluation of rules until rules
         * with lower sequence number have successfully validated. The "then" fluent API method
         * manages this property, there's usually no need to set it directly.
         */
        this.sequence = 0;
    }
    /**
     * Sets the display name of the ensured property.
     */
    FluentRules.prototype.displayName = function (name) {
        this.property.displayName = name;
        return this;
    };
    /**
     * Applies an ad-hoc rule function to the ensured property or object.
     * @param condition The function to validate the rule.
     * Will be called with two arguments, the property value and the object.
     * Should return a boolean or a Promise that resolves to a boolean.
     */
    FluentRules.prototype.satisfies = function (condition, config) {
        return new FluentRuleCustomizer(this.property, condition, config, this.fluentEnsure, this, this.parser);
    };
    /**
     * Applies a rule by name.
     * @param name The name of the custom or standard rule.
     * @param args The rule's arguments.
     */
    FluentRules.prototype.satisfiesRule = function (name) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var rule = FluentRules.customRules[name];
        if (!rule) {
            // standard rule?
            rule = this[name];
            if (rule instanceof Function) {
                return rule.call.apply(rule, [this].concat(args));
            }
            throw new Error("Rule with name \"" + name + "\" does not exist.");
        }
        var config = rule.argsToConfig ? rule.argsToConfig.apply(rule, args) : undefined;
        return this.satisfies(function (value, obj) {
            return (_a = rule.condition).call.apply(_a, [_this, value, obj].concat(args));
            var _a;
        }, config)
            .withMessageKey(name);
    };
    /**
     * Applies the "required" rule to the property.
     * The value cannot be null, undefined or whitespace.
     */
    FluentRules.prototype.required = function () {
        return this.satisfies(function (value) {
            return value !== null
                && value !== undefined
                && !(isString(value) && !/\S/.test(value));
        }).withMessageKey('required');
    };
    /**
     * Applies the "matches" rule to the property.
     * Value must match the specified regular expression.
     * null, undefined and empty-string values are considered valid.
     */
    FluentRules.prototype.matches = function (regex) {
        return this.satisfies(function (value) { return value === null || value === undefined || value.length === 0 || regex.test(value); })
            .withMessageKey('matches');
    };
    /**
     * Applies the "email" rule to the property.
     * null, undefined and empty-string values are considered valid.
     */
    FluentRules.prototype.email = function () {
        // regex from https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
        /* tslint:disable:max-line-length */
        return this.matches(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)
            .withMessageKey('email');
    };
    /**
     * Applies the "minLength" STRING validation rule to the property.
     * null, undefined and empty-string values are considered valid.
     */
    FluentRules.prototype.minLength = function (length) {
        return this.satisfies(function (value) { return value === null || value === undefined || value.length === 0 || value.length >= length; }, { length: length })
            .withMessageKey('minLength');
    };
    /**
     * Applies the "maxLength" STRING validation rule to the property.
     * null, undefined and empty-string values are considered valid.
     */
    FluentRules.prototype.maxLength = function (length) {
        return this.satisfies(function (value) { return value === null || value === undefined || value.length === 0 || value.length <= length; }, { length: length })
            .withMessageKey('maxLength');
    };
    /**
     * Applies the "minItems" ARRAY validation rule to the property.
     * null and undefined values are considered valid.
     */
    FluentRules.prototype.minItems = function (count) {
        return this.satisfies(function (value) { return value === null || value === undefined || value.length >= count; }, { count: count })
            .withMessageKey('minItems');
    };
    /**
     * Applies the "maxItems" ARRAY validation rule to the property.
     * null and undefined values are considered valid.
     */
    FluentRules.prototype.maxItems = function (count) {
        return this.satisfies(function (value) { return value === null || value === undefined || value.length <= count; }, { count: count })
            .withMessageKey('maxItems');
    };
    /**
     * Applies the "equals" validation rule to the property.
     * null and undefined values are considered valid.
     */
    FluentRules.prototype.equals = function (expectedValue) {
        return this.satisfies(function (value) { return value === null || value === undefined || value === '' || value === expectedValue; }, { expectedValue: expectedValue })
            .withMessageKey('equals');
    };
    return FluentRules;
}());
export { FluentRules };
FluentRules.customRules = {};
/**
 * Part of the fluent rule API. Enables targeting properties and objects with rules.
 */
var FluentEnsure = (function () {
    function FluentEnsure(parser) {
        this.parser = parser;
        /**
         * Rules that have been defined using the fluent API.
         */
        this.rules = [];
    }
    /**
     * Target a property with validation rules.
     * @param property The property to target. Can be the property name or a property accessor
     * function.
     */
    FluentEnsure.prototype.ensure = function (property) {
        this.assertInitialized();
        return new FluentRules(this, this.parser, this.parser.parseProperty(property));
    };
    /**
     * Targets an object with validation rules.
     */
    FluentEnsure.prototype.ensureObject = function () {
        this.assertInitialized();
        return new FluentRules(this, this.parser, { name: null, displayName: null });
    };
    /**
     * Applies the rules to a class or object, making them discoverable by the StandardValidator.
     * @param target A class or object.
     */
    FluentEnsure.prototype.on = function (target) {
        Rules.set(target, this.rules);
        return this;
    };
    /**
     * Adds a rule definition to the sequenced ruleset.
     * @internal
     */
    FluentEnsure.prototype._addRule = function (rule) {
        while (this.rules.length < rule.sequence + 1) {
            this.rules.push([]);
        }
        this.rules[rule.sequence].push(rule);
    };
    FluentEnsure.prototype.assertInitialized = function () {
        if (this.parser) {
            return;
        }
        throw new Error("Did you forget to add \".plugin('aurelia-validation')\" to your main.js?");
    };
    return FluentEnsure;
}());
export { FluentEnsure };
/**
 * Fluent rule definition API.
 */
var ValidationRules = (function () {
    function ValidationRules() {
    }
    ValidationRules.initialize = function (parser) {
        ValidationRules.parser = parser;
    };
    /**
     * Target a property with validation rules.
     * @param property The property to target. Can be the property name or a property accessor function.
     */
    ValidationRules.ensure = function (property) {
        return new FluentEnsure(ValidationRules.parser).ensure(property);
    };
    /**
     * Targets an object with validation rules.
     */
    ValidationRules.ensureObject = function () {
        return new FluentEnsure(ValidationRules.parser).ensureObject();
    };
    /**
     * Defines a custom rule.
     * @param name The name of the custom rule. Also serves as the message key.
     * @param condition The rule function.
     * @param message The message expression
     * @param argsToConfig A function that maps the rule's arguments to a "config"
     * object that can be used when evaluating the message expression.
     */
    ValidationRules.customRule = function (name, condition, message, argsToConfig) {
        validationMessages[name] = message;
        FluentRules.customRules[name] = { condition: condition, argsToConfig: argsToConfig };
    };
    /**
     * Returns rules with the matching tag.
     * @param rules The rules to search.
     * @param tag The tag to search for.
     */
    ValidationRules.taggedRules = function (rules, tag) {
        return rules.map(function (x) { return x.filter(function (r) { return r.tag === tag; }); });
    };
    /**
     * Removes the rules from a class or object.
     * @param target A class or object.
     */
    ValidationRules.off = function (target) {
        Rules.unset(target);
    };
    return ValidationRules;
}());
export { ValidationRules };
