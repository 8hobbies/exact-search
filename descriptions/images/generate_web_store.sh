#!/bin/bash

# Run this script to generate the web store screenshot

montage off.png on.png -tile 2x1 -geometry 620x780+0+0 -border 10 out.png
