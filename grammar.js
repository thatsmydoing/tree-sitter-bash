module.exports = grammar({
  name: 'bash',

  inline: $ => [$.control_operator],

  rules: {
    program: $ => repeat($.command),

    command: $ => seq(
      choice(
        $.simple_command,
        $.pipeline,
        $.list
      ),
      $.control_operator
    ),

    simple_command: $ => seq(
      repeat(choice(
        $.environment_variable_assignment,
        $.file_redirect
      )),
      rename($.leading_word, 'command_name'),
      optional(seq(
        /\s+/,
        repeat(rename($.word, 'argument'))
      )),
      repeat(
        $.file_redirect
      )
    ),

    pipeline: $ => prec.left(seq(
      $.simple_command,
      choice('|', '|&'),
      $.simple_command
    )),

    list: $ => prec.left(seq(
      choice(
        $.simple_command,
        $.list,
        $.pipeline
      ),
      choice('&&', ';'),
      choice(
        $.simple_command,
        $.pipeline
      )
    )),

    environment_variable_assignment: $ => seq(
      rename($.leading_word, 'variable_name'),
      '=',
      rename($.word, 'argument')
    ),

    file_redirect: $ => seq(
      optional($.file_descriptor),
      choice('<', '>', '<&', '>&'),
      choice(
        $.file_descriptor,
        rename($.word, 'file_name')
      )
    ),

    file_descriptor: $ => token(prec(1, /\d+/)),

    leading_word: $ => /[^\s=|;]+/,

    word: $ => /[^\s<>&]+/,

    control_operator: $ => choice(
      '\n',
      ';;'
    )
  }
});