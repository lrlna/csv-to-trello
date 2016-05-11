This is a repo to convert a csv into some card on Trello; was used for CasadiaFest sponsor organization.

It will do the following for you:
- create a new Board
- create a new List
- creates a set of Cards, where each *row* is a *card*
- name of the card is based on the first row + first column value

This is super hard coded, and will be refactored for better use in the future.

Usage thus far:

```
node index.js file.csv
```
