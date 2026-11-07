#set page(paper: "a4")
#let style(body) = {
  set text(size: 10pt)
  body
}
#import "template.typ": *
#show heading: it => [#strong(it.body)]

The first finding may suggest benefit #cite(<author2025>).
#figure(
  rect(width: 10pt),
  caption: [A protected caption with [nested content].],
) <fig:a>

The result appears in @fig:a, with $ x^2 $ unchanged.
A note #footnote[Keep [nested content] and $x$.] follows.
