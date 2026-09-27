# Setup visuals

The five screenshots on the setup page are drawn, not captured. `gen-setup-visuals.py`
writes `steps.html`, an HTML mock of VS Code in each of the five states, with numbered
pins and a legend. Playwright screenshots each `.stage` element at 2x.

To change a label, an Explorer row, or a terminal line, edit the `SC` list in the script.

```
python3 gen-setup-visuals.py                       # writes steps.html
# then screenshot each #stepN .stage at device_scale_factor 2
# and scale to 1416px wide into ../../public/img/setup-stepN.png
```

Replacing any of these with a real screenshot of your own machine works too: save it at
the same path in `public/img/` and the page picks it up with no code change.
