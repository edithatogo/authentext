#set page(width: 21cm, height: 29.7cm)
#let decorate(body) = box(stroke: 1pt)[#body]
#show heading: it => block[Their #it.body]
#import "theme.typ": theme

The intervention may improve outcomes #cite(<author2025>).

#figure(
  image("figure.png"),
  caption: [A nested [description] with (brackets).],
) <fig:a>

See @fig:a and #ref(<fig:a>). The parameter $ x^2 $ is positive.
A note #footnote[Keep this exact prose.] is retained.
