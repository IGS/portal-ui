// @flow
import Color from 'color';
import React from 'react';
import { Row, Column } from '@ncigdc/uikit/Flex';
import Card from '@ncigdc/uikit/Card';
import styled from '@ncigdc/theme/styled';
import RepositoryLink from '@ncigdc/components/Links/RepositoryLink';
import ExploreLink from '@ncigdc/components/Links/ExploreLink';
import AnalysisLink from '@ncigdc/components/Links/AnalysisLink';


const Header = styled(Row, {
  fontSize: '2rem',
  color: ({ theme }) => theme.greyScale7 || 'silver',
});

const LeftColumn = styled(Column, {
  margin: '1rem',
  width: '25vw',
  padding: '3rem',
  flexDirection: 'column',
  flexWrap: 'wrap',
  color: ({theme}) => theme.greyScale7 || 'silver',
});

const HomeRouteRow = styled(Row, {
  padding: '15px'
});

const HomeRouteCard = styled(Card, {
  padding: '15px'
});

const RightColumn = styled(Column, {
  margin: '1rem',
  width: '75vw',
  padding: '3rem',
  float: 'right',
  flexDirection: 'column',
  flexWrap: 'wrap',
  color: ({theme}) => theme.greyScale7 || 'silver',
});

const HomeRouteContainer = styled(Row, {
  display: 'inline-flex'
});

const linkStyle = {
  textDecoration: 'none !important',
  color: 'white !important',
  display: 'inline-block',
  whiteSpace: 'nowrap',
  padding: '0.5rem 1rem 0.5rem 0.5rem',
  textAlign: 'left',
  fontSize: '1.5rem',
  minWidth: '13.5rem',
  margin: 0,
  height: '4rem',
  borderRadius: '6px',
  transition: '0.25s ease all',
  backgroundColor: props => props.backgroundColor || props.theme.primary,
  ':hover': {
    backgroundColor: props => Color(props.backgroundColor || props.theme.primary)
      .lighten(0.2)
      .rgbString(),
  },
};

const Repository = styled(RepositoryLink, linkStyle);
const Explore = styled(ExploreLink, linkStyle);
const Analysis = styled(AnalysisLink, linkStyle);

const Home = () => (
  <HomeRouteContainer>
    <LeftColumn>
      <HomeRouteRow>
        <HomeRouteCard>
          KIDNEY PRECISION MEDICIN PROJECT
          <Header> Kidney Tissue Atlas</Header>
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
        </HomeRouteCard>
      </HomeRouteRow>
      <HomeRouteRow>
        <HomeRouteCard>
          <Header>Atlas Analyzer</Header>
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
          <Row>
            <Analysis backgroundColor="#0275d8"><span style={{ verticalAlign: 'middle' }}>Go to Analysis</span></Analysis>
          </Row>
        </HomeRouteCard>
      </HomeRouteRow>
      <HomeRouteRow>
        <HomeRouteCard>
          <Header>Atlas Explorer</Header>
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
          <Row>
            <Explore backgroundColor="#0275d8"><span style={{ verticalAlign: 'middle' }}>Go to Explorer</span></Explore>
          </Row>
        </HomeRouteCard>
      </HomeRouteRow>
      <HomeRouteRow>
        <HomeRouteCard>
          <Header>Atlas Repository</Header>
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
          <Row>
            <Repository backgroundColor="#0275d8"><span style={{ verticalAlign: 'middle' }}>Go to Repository</span></Repository>
          </Row>
        </HomeRouteCard>
      </HomeRouteRow>
    </LeftColumn>
    <RightColumn>
      <HomeRouteRow>
        <HomeRouteCard>
          <Header>Atlas Data Summary</Header>
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
        </HomeRouteCard>
      </HomeRouteRow>
    </RightColumn>
  </HomeRouteContainer>
  
);

export default Home;
