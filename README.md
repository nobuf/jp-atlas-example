# jp-atlas-example

An example of rendering Japan's administrative divisions and population with TopoJSON and D3.

## Demo

https://nobuf.github.io/jp-atlas-example/

## Data

### population_in_japan_2017.csv

http://www.soumu.go.jp/menu_news/s-news/01gyosei02_02000148.html

Use [xls2csv-server](https://github.com/nobuf/xls2csv-server) to convert XSL to CSV.

```shell
curl -O http://www.soumu.go.jp/main_content/000494090.xls
curl -F "file=@000494090.xls" http://localhost:5001/ \
  | grep -v ",男," \
  | grep -v ",女," \
  | awk -F "\"*,\"*" '{print $1","$5","$26}' \
  | tail -n +2 > docs/100_year_old_population_in_japan_2017.csv
```

### cities_in_japan_2016.csv

https://github.com/nobuf/list-of-cities-in-japan

### japan-2017-topo.json

https://github.com/nobuf/jp-atlas

## Contributing

If you have any ideas let @nobuf know by opening an issue. Pull requests are warmly welcome.

## License

MIT
