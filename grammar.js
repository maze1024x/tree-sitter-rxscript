// @ts-nocheck

// DO NOT EDIT TOKENS/RULES (generated from syntax_test.go)

// TOKENS
const Pragma = /#![^\n]*/
const Doc = /\/\/\/[^\n]*/
const Comment = /\/\/[^\n]*/
const Blank = /[ \t\r　]+/
const LF = /[\n]+/
const Text = /'[^']*'|"(\\"|[^"])*"/
const Int = /\-?0[xX][0-9A-Fa-f]+|\-?0[oO][0-7]+|\-?0[bB][01]+|\-?\d+/
const Float = /\-?\d+(\.\d+)?[Ee][\+\-]?\d+|\-?\d+\.\d+/
const Byte = /\\x[0-9A-Fa-f][0-9A-Fa-f]/
const Char = /`.`|\\u[0-9A-Fa-f]+|\\[a-z]/
const Name = /[^0-9\{\}\[\]\(\)\.,:;@\|\&\\'"` \t\r　\n][^\{\}\[\]\(\)\.,:;@\|\&\\'"` \t\r　\n]*/

const IgnoreRule = $ => Comment
const IgnoreTokens = [Blank, LF]
const IgnoreRuleKey = 'tree_sitter_ignore_rule'

module.exports = grammar({
    name: 'rxscript',
    extras: $ => [$[IgnoreRuleKey], ...IgnoreTokens],
    rules: (raw => {
        let rules = {}
        for (let [k,v] of Object.entries(raw)) {
            rules[k] = v
        }
        rules[IgnoreRuleKey] = IgnoreRule
        return rules
    })({
        // RULES
        source_file: $ => seq(optional($.shebang), $.ns, repeat($.alias), repeat($.stmt)),
        shebang: $ => Pragma,
        ns: $ => seq('namespace', optional($.name), '::'),
        name: $ => Name,
        alias: $ => seq('using', optional($.alias_name), $.alias_target),
        alias_name: $ => seq($.name, '='),
        alias_target: $ => choice($.alias_to_ns, $.alias_to_ref_base),
        alias_to_ns: $ => seq('namespace', $.name),
        alias_to_ref_base: $ => $.ref_base,
        stmt: $ => choice($.decl_entry, $.decl_type, $.decl_func, $.decl_const, $.decl_method),
        decl_entry: $ => seq(optional($.docs), 'entry', $.block),
        docs: $ => repeat1($.doc),
        doc: $ => Doc,
        decl_type: $ => seq(optional($.docs), 'type', $.name, optional($.type_params), optional($.impl), $.type_def),
        type_params: $ => seq('[', optional(seq($.name, repeat(seq(',', $.name)))), ']'),
        impl: $ => seq('(', optional(seq($.ref_base, repeat(seq(',', $.ref_base)))), ')'),
        ref_base: $ => seq(optional($.ns_prefix), $.name),
        ns_prefix: $ => seq($.name, '::'),
        type_def: $ => choice('native', $.record, $.interface, $.union, $.enum),
        record: $ => seq('record', $.record_def),
        record_def: $ => seq('{', optional(seq($.field, repeat(seq(',', $.field)))), '}'),
        field: $ => seq(optional($.docs), $.name, $.type, optional($.field_default)),
        field_default: $ => seq('(', $.expr, ')'),
        interface: $ => seq('interface', '{', optional(seq($.method, repeat(seq(',', $.method)))), '}'),
        method: $ => seq(optional($.docs), $.name, $.type),
        union: $ => seq('union', '{', seq($.type, repeat(seq(',', $.type))), '}'),
        enum: $ => seq('enum', '{', seq($.enum_item, repeat(seq(',', $.enum_item))), '}'),
        enum_item: $ => seq(optional($.docs), $.name),
        decl_func: $ => seq(optional($.docs), choice('function', 'operator'), optional('variadic'), $.name, $.sig, $.body),
        sig: $ => seq(optional($.type_params), $.inputs, optional($.implicit), $.output),
        inputs: $ => $.record_def,
        implicit: $ => $.inputs,
        output: $ => $.type,
        body: $ => choice($.native_body, $.block),
        native_body: $ => seq('native', '(', $.text, ')'),
        decl_const: $ => seq(optional($.docs), 'const', $.name, $.type, $.body),
        decl_method: $ => seq(optional($.docs), 'method', $.receiver, '.', $.name, $.type, $.body),
        receiver: $ => $.name,
        type: $ => $.ref,
        ref: $ => seq($.ref_base, optional($.type_args)),
        type_args: $ => seq('[', optional(seq($.type, repeat(seq(',', $.type)))), ']'),
        expr: $ => seq(repeat($.cast), $.term, repeat($.pipe)),
        cast: $ => seq('(', '[', $.type, ']', ')'),
        pipe: $ => choice($.pipe_call, $.pipe_infix, $.pipe_cast, $.pipe_get, $.pipe_interior),
        pipe_call: $ => choice($.call_ordered, $.call_unordered),
        call_ordered: $ => seq('(', optional(seq($.expr, repeat(seq(',', $.expr)))), ')'),
        call_unordered: $ => seq('{', optional(seq($.arg_mapping, repeat(seq(',', $.arg_mapping)))), '}'),
        arg_mapping: $ => seq($.name, optional($.arg_mapping_to)),
        arg_mapping_to: $ => seq(':', $.expr),
        pipe_infix: $ => seq('|', $.ref, $.pipe_call),
        pipe_cast: $ => seq('.', $.cast),
        pipe_get: $ => seq('.', $.name),
        pipe_interior: $ => seq('.', '(', $.ref_base, ')'),
        term: $ => choice($.infix_term, $.lambda, $.if, $.when, $.each, $.block, $.ref_term, $.int, $.float, $.char, $.bytes, $.string),
        infix_term: $ => seq('(', $.infix_left, $.operator, $.infix_right, ')'),
        infix_left: $ => $.expr,
        operator: $ => $.ref,
        infix_right: $ => $.expr,
        lambda: $ => seq('{', optional($.pattern), optional($.lambda_self), '=>', $.expr, '}'),
        lambda_self: $ => seq('&', $.name),
        pattern: $ => choice($.pattern_single, $.pattern_multiple),
        pattern_single: $ => $.name,
        pattern_multiple: $ => seq('(', seq($.name, repeat(seq(',', $.name))), ')'),
        if: $ => seq('if', '(', seq($.cond, repeat(seq(',', $.cond))), ')', $.if_yes, repeat($.elif), 'else', $.if_no),
        cond: $ => seq(optional($.cond_pattern), $.expr),
        cond_pattern: $ => seq('let', $.pattern, '='),
        if_yes: $ => $.block,
        if_no: $ => $.block,
        elif: $ => seq('if', '(', seq($.cond, repeat(seq(',', $.cond))), ')', $.block),
        when: $ => seq('when', '(', $.expr, ')', '{', seq($.case, repeat(seq(',', $.case))), '}'),
        case: $ => seq(seq($.name, repeat(seq('|', $.name))), optional($.pattern), '=>', $.expr),
        each: $ => seq('each', '(', $.type, ')', '{', seq($.case, repeat(seq(',', $.case))), '}'),
        block: $ => seq('{', repeat($.binding), $.expr, '}'),
        binding: $ => choice($.binding_plain, $.binding_cps),
        binding_plain: $ => seq(choice('let', 'const'), $.pattern, '=', $.expr, ','),
        binding_cps: $ => seq('@', $.ref, optional($.cps_pattern), $.expr, ','),
        cps_pattern: $ => seq($.pattern, '='),
        ref_term: $ => seq(optional($.new), $.ref),
        new: $ => seq('new', optional($.new_tag)),
        new_tag: $ => seq(':', $.name),
        int: $ => Int,
        float: $ => Float,
        char: $ => Char,
        bytes: $ => repeat1($.byte),
        byte: $ => Byte,
        string: $ => seq($.text, repeat($.string_part)),
        text: $ => Text,
        string_part: $ => seq('..', $.string_part_content),
        string_part_content: $ => choice($.text, $.char),
    })
});


