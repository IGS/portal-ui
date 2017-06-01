/**
 * This file was generated by:
 *   relay-compiler
 *
 * @providesModule HomePage_viewer.graphql
 * @generated SignedSource<<aa7b5b52e9a7083efbc601354265217c>>
 * @flow
 * @nogrep
 */

/*::
import type {ConcreteFragment} from 'relay-runtime';
export type HomePage_viewer = {
  projects?: ?HomePage_viewer_projects;
  repository?: ?HomePage_viewer_repository;
  explore?: ?HomePage_viewer_explore;
};

export type HomePage_viewer_projects_aggregations_primary_site_buckets = {
  key?: ?string;
};

export type HomePage_viewer_projects_aggregations_primary_site = {
  buckets?: ?Array<?HomePage_viewer_projects_aggregations_primary_site_buckets>;
};

export type HomePage_viewer_projects_aggregations = {
  primary_site?: ?HomePage_viewer_projects_aggregations_primary_site;
};

export type HomePage_viewer_projects_hits_edges_node_summary = {
  case_count?: ?number;
  file_count?: ?number;
};

export type HomePage_viewer_projects_hits_edges_node = {
  id: string;
  project_id?: ?string;
  primary_site?: ?Array<?string>;
  summary?: ?HomePage_viewer_projects_hits_edges_node_summary;
};

export type HomePage_viewer_projects_hits_edges = {
  node?: ?HomePage_viewer_projects_hits_edges_node;
};

export type HomePage_viewer_projects_hits = {
  edges?: ?Array<?HomePage_viewer_projects_hits_edges>;
  total: number;
};

export type HomePage_viewer_projects = {
  aggregations?: ?HomePage_viewer_projects_aggregations;
  hits?: ?HomePage_viewer_projects_hits;
};

export type HomePage_viewer_repository_cases_hits = {
  total: number;
};

export type HomePage_viewer_repository_cases = {
  hits?: ?HomePage_viewer_repository_cases_hits;
};

export type HomePage_viewer_repository_files_hits = {
  total: number;
};

export type HomePage_viewer_repository_files = {
  hits?: ?HomePage_viewer_repository_files_hits;
};

export type HomePage_viewer_repository = {
  cases?: ?HomePage_viewer_repository_cases;
  files?: ?HomePage_viewer_repository_files;
};

export type HomePage_viewer_explore_genes_hits = {
  total: number;
};

export type HomePage_viewer_explore_genes = {
  hits?: ?HomePage_viewer_explore_genes_hits;
};

export type HomePage_viewer_explore_ssms_hits = {
  total: number;
};

export type HomePage_viewer_explore_ssms = {
  hits?: ?HomePage_viewer_explore_ssms_hits;
};

export type HomePage_viewer_explore = {
  genes?: ?HomePage_viewer_explore_genes;
  ssms?: ?HomePage_viewer_explore_ssms;
};
*/

/* eslint-disable comma-dangle, quotes */

const fragment /*: ConcreteFragment*/ = {
  argumentDefinitions: [],
  kind: "Fragment",
  metadata: null,
  name: "HomePage_viewer",
  selections: [
    {
      kind: "LinkedField",
      alias: null,
      args: null,
      concreteType: "Projects",
      name: "projects",
      plural: false,
      selections: [
        {
          kind: "LinkedField",
          alias: null,
          args: null,
          concreteType: "ProjectAggregations",
          name: "aggregations",
          plural: false,
          selections: [
            {
              kind: "LinkedField",
              alias: null,
              args: null,
              concreteType: "Aggregations",
              name: "primary_site",
              plural: false,
              selections: [
                {
                  kind: "LinkedField",
                  alias: null,
                  args: null,
                  concreteType: "Bucket",
                  name: "buckets",
                  plural: true,
                  selections: [
                    {
                      kind: "ScalarField",
                      alias: null,
                      args: null,
                      name: "key",
                      storageKey: null
                    }
                  ],
                  storageKey: null
                }
              ],
              storageKey: null
            }
          ],
          storageKey: null
        },
        {
          kind: "LinkedField",
          alias: null,
          args: [
            {
              kind: "Literal",
              name: "first",
              value: 1000,
              type: "Int"
            }
          ],
          concreteType: "ProjectConnection",
          name: "hits",
          plural: false,
          selections: [
            {
              kind: "LinkedField",
              alias: null,
              args: null,
              concreteType: "ProjectEdge",
              name: "edges",
              plural: true,
              selections: [
                {
                  kind: "LinkedField",
                  alias: null,
                  args: null,
                  concreteType: "Project",
                  name: "node",
                  plural: false,
                  selections: [
                    {
                      kind: "ScalarField",
                      alias: null,
                      args: null,
                      name: "id",
                      storageKey: null
                    },
                    {
                      kind: "ScalarField",
                      alias: null,
                      args: null,
                      name: "project_id",
                      storageKey: null
                    },
                    {
                      kind: "ScalarField",
                      alias: null,
                      args: null,
                      name: "primary_site",
                      storageKey: null
                    },
                    {
                      kind: "LinkedField",
                      alias: null,
                      args: null,
                      concreteType: "Summary",
                      name: "summary",
                      plural: false,
                      selections: [
                        {
                          kind: "ScalarField",
                          alias: null,
                          args: null,
                          name: "case_count",
                          storageKey: null
                        },
                        {
                          kind: "ScalarField",
                          alias: null,
                          args: null,
                          name: "file_count",
                          storageKey: null
                        }
                      ],
                      storageKey: null
                    }
                  ],
                  storageKey: null
                }
              ],
              storageKey: null
            },
            {
              kind: "ScalarField",
              alias: null,
              args: null,
              name: "total",
              storageKey: null
            }
          ],
          storageKey: 'hits{"first":1000}'
        }
      ],
      storageKey: null
    },
    {
      kind: "LinkedField",
      alias: null,
      args: null,
      concreteType: "Repository",
      name: "repository",
      plural: false,
      selections: [
        {
          kind: "LinkedField",
          alias: null,
          args: null,
          concreteType: "RepositoryCases",
          name: "cases",
          plural: false,
          selections: [
            {
              kind: "LinkedField",
              alias: null,
              args: [
                {
                  kind: "Literal",
                  name: "first",
                  value: 0,
                  type: "Int"
                },
                {
                  kind: "Literal",
                  name: "offset",
                  value: 0,
                  type: "Int"
                }
              ],
              concreteType: "CaseConnection",
              name: "hits",
              plural: false,
              selections: [
                {
                  kind: "ScalarField",
                  alias: null,
                  args: null,
                  name: "total",
                  storageKey: null
                }
              ],
              storageKey: 'hits{"first":0,"offset":0}'
            }
          ],
          storageKey: null
        },
        {
          kind: "LinkedField",
          alias: null,
          args: null,
          concreteType: "Files",
          name: "files",
          plural: false,
          selections: [
            {
              kind: "LinkedField",
              alias: null,
              args: [
                {
                  kind: "Literal",
                  name: "first",
                  value: 0,
                  type: "Int"
                },
                {
                  kind: "Literal",
                  name: "offset",
                  value: 0,
                  type: "Int"
                }
              ],
              concreteType: "FileConnection",
              name: "hits",
              plural: false,
              selections: [
                {
                  kind: "ScalarField",
                  alias: null,
                  args: null,
                  name: "total",
                  storageKey: null
                }
              ],
              storageKey: 'hits{"first":0,"offset":0}'
            }
          ],
          storageKey: null
        }
      ],
      storageKey: null
    },
    {
      kind: "LinkedField",
      alias: null,
      args: null,
      concreteType: "Explore",
      name: "explore",
      plural: false,
      selections: [
        {
          kind: "LinkedField",
          alias: null,
          args: null,
          concreteType: "Genes",
          name: "genes",
          plural: false,
          selections: [
            {
              kind: "LinkedField",
              alias: null,
              args: [
                {
                  kind: "Literal",
                  name: "first",
                  value: 0,
                  type: "Int"
                },
                {
                  kind: "Literal",
                  name: "offset",
                  value: 0,
                  type: "Int"
                }
              ],
              concreteType: "GeneConnection",
              name: "hits",
              plural: false,
              selections: [
                {
                  kind: "ScalarField",
                  alias: null,
                  args: null,
                  name: "total",
                  storageKey: null
                }
              ],
              storageKey: 'hits{"first":0,"offset":0}'
            }
          ],
          storageKey: null
        },
        {
          kind: "LinkedField",
          alias: null,
          args: null,
          concreteType: "Ssms",
          name: "ssms",
          plural: false,
          selections: [
            {
              kind: "LinkedField",
              alias: null,
              args: [
                {
                  kind: "Literal",
                  name: "first",
                  value: 0,
                  type: "Int"
                },
                {
                  kind: "Literal",
                  name: "offset",
                  value: 0,
                  type: "Int"
                }
              ],
              concreteType: "SsmConnection",
              name: "hits",
              plural: false,
              selections: [
                {
                  kind: "ScalarField",
                  alias: null,
                  args: null,
                  name: "total",
                  storageKey: null
                }
              ],
              storageKey: 'hits{"first":0,"offset":0}'
            }
          ],
          storageKey: null
        }
      ],
      storageKey: null
    }
  ],
  type: "Root"
};

module.exports = fragment;