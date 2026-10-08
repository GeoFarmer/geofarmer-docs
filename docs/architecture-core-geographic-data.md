---
title: Geographic reference data
---

# Geographic reference data

Core's built-in boundaries live in
`geofarmer-core/apps/api/database/data/default-regions`:

| File | Coverage |
| --- | --- |
| `countries.geojson` | Administrative level 0 |
| `subdivisions.geojson` | Administrative level 1 |

Both are WGS84 GeoJSON `FeatureCollection` files with Polygon or MultiPolygon
features derived from Natural Earth 5.1.1. Dataset provenance is stored on the
geographic-region set version. Original feature properties are retained in each
region's `metadata` column during import.

External identifiers must remain stable and unique within a set version. The
current importer uses Natural Earth's `ADM0_A3` identifier for countries and
`adm1_code` for subdivisions. Preserve these identity and provenance rules when
updating the bundled data.
