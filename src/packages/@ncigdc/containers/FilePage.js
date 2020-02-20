/* @flow */

import React from 'react';
import Relay from 'react-relay/classic';

import FullWidthLayout from '@ncigdc/components/Layouts/FullWidthLayout';
import File from '@ncigdc/components/File';

export type TProps = {
  node: {
    access: string,
    cases: Array<{
      project: {
        project_id: string,
      },
    }>,
    data_category: string,
    data_format: string,
    file_id: string,
    file_name: string,
    file_size: number,
    platform: string,
  },
};

export const FilePageComponent = (props: TProps) => (
  <FullWidthLayout
    title={props.node.file_name}
    entityType="FL"
    className="test-file-page"
  >
    <File node={props.node} />
  </FullWidthLayout>
);

export const FilePageQuery = {
  fragments: {
    node: () => Relay.QL`
      fragment on FileNode {
        file_id
        file_id
        file_name
        file_size
        access
        data_category
        data_format
        data_type
        experimental_strategy
      }
    `,
  },
};

const FilePage = Relay.createContainer(FilePageComponent, FilePageQuery);

export default FilePage;
