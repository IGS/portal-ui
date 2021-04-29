// @flow
import React from 'react';
import HomeLink from '@ncigdc/components/Links/HomeLink';
import {Button, Col, Row} from "reactstrap";

export default () => (
    <article className="container" id='not-found-page'>
        <Row id="not-found-container" className='mr-5 p-5'>
            <Col xs={12} md={4}>
                <img className='not-found-image' src="img/404-img.svg" alt="Page not found" id="oops-image"/>
            </Col>
            <Col xs={12} md={8} className='not-found-text'>
                <p className="not-found-regular">Sorry. We couldn't find the page you're looking for.</p>
                <p className="not-found-small">
                    If you're still having problems, please contact <a href='mailto:admin@kpmp.org'>admin@kpmp.org</a>
                </p>
                <p className="oops-button-container">
                    <Button color='primary'
                            className="btn btn-primary"
                            onClick={() => (window.location.href = '/repository')}
                    >
                        Back to Home
                    </Button>
                </p>
            </Col>
        </Row>
    </article>
);
