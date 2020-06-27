import { Component, Fragment } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Spin, Rate } from 'antd';
import { Trans, NumberFormat } from '@lingui/macro';
import { get, has, head } from 'lodash';

import styled from 'styled-components';
import withRouter from 'umi/withRouter';

const Page = styled.div`
  @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,400i,700&subset=latin-ext');
  font-family: 'Open Sans', sans-serif;

  @import url('https://fonts.googleapis.com/css2?family=Aleo&family=Montserrat:wght@300&family=Mr+Dafoe&display=swap');
  font-family: 'Aleo', serif;

  .line-break {
    white-space: pre-line;
  }

  .invoice {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    display: flex;
    flex-direction: column;

    color: black;
    background-color: #f4f4f4;
  }

  .header {
    font-family: 'Mr Dafoe', cursive;
    width: 100%;
    text-align: center;
    font-size: 7rem;

    border-bottom: solid black 8px;
  }

  .content {
    flex-grow: 2;
    width: 100%;
  }

  .details {
    width: 100%;
    padding: 0 3rem 1rem 3rem;
  }
  .details .left,
  .details .right {
    display: inline-block;
    width: 50%;
  }
  .details .right {
    text-align: right;
  }

  .detail-item label {
    display: block !important;
    margin-bottom: 0 !important;

    font-family: 'Montserrat', sans-serif;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .notes {
    width: 100%;
    padding: 0 3rem 1rem 3rem;
    font-style: italic;
  }

  .footer {
    width: 100%;
    text-align: center;
    padding: 1rem;

    background-color: black;
    color: white;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .footer a {
    color: white !important;
  }

  #lines {
    width: 90%;
    margin-left: 5%;

    table {
      td {
        &.min-width {
          width: 1%;
          white-space: nowrap;
        }
        &.spaced {
          padding-left: 20px;
        }
        border: 0;
      }

      tr {
        border: 0;
      }

      thead {
        font-family: 'Montserrat', sans-serif;
        text-transform: uppercase;
      }

      tfoot {
        tr:first-of-type td {
          padding-top: 1.75rem;
        }
        td {
          padding: 0.25rem;
        }
        td.label {
          font-family: 'Montserrat', sans-serif;
          text-transform: uppercase;
        }
      }

      thead::after,
      tbody::after {
        content: ' ';
        height: 3px;
        width: 21cm;
        margin-left: -55px;
        background-color: black;
        display: block;
        position: absolute;
      }
    }
  }
`;

class Invoice extends Component {
  componentDidMount() {
    this.props.dispatch({ type: 'organizations/list' });
    this.props.dispatch({ type: 'taxRates/list' });
    this.props.dispatch({
      type: 'organizations/getLogo',
      payload: {
        id: localStorage.getItem('organization'),
      },
    });

    if (get(this.props, ['match', 'path'], '').endsWith('pdf')) {
      const { ipcRenderer } = window.require('electron');

      const { invoices } = this.props;
      const invoice = get(invoices.items, get(this.props, ['match', 'params', 'id']));

      setTimeout(
        () => ipcRenderer.send('readyToPrint', `Invoice ${get(invoice, 'number')}.pdf`),
        200
      );
    }
  }

  render() {
    const { clients, organizations, invoices, taxRates } = this.props;
    const organization = get(organizations.items, localStorage.getItem('organization'));
    const logo = get(organizations.logos, localStorage.getItem('organization'));
    const invoice = get(invoices.items, get(this.props, ['match', 'params', 'id']));
    const client = invoice ? get(clients.items, invoice.client) : null;

    return (
      <Page id="bootstrapped">
        {client && organization && invoice ? (
          <div className="invoice">
            <div className="header">Balte.nl</div>
            <div className="content">
              <div id="lines" className="row">
                <div className="col">
                  <table className="table">
                    <thead>
                      <tr>
                        <td className="border-top-0 min-width text-center">#</td>
                        <td className="border-top-0">
                          <Trans>Description</Trans>
                        </td>
                        <td className="border-top-0 min-width">
                          <Trans>Quantity</Trans>
                        </td>
                        <td className="border-top-0 min-width spaced text-right">
                          <Trans>Price</Trans>
                        </td>
                        <td className="border-top-0 min-width spaced text-right">
                          <Trans>Sum</Trans>
                        </td>
                      </tr>
                    </thead>
                    <tfoot>
                      <tr>
                        <td colSpan="2" />
                        <td colSpan="2" className="label">
                          <Trans>Subtotal</Trans>
                        </td>
                        <td className="text-right">
                          <NumberFormat
                            value={invoice.subTotal}
                            format={{
                              style: 'currency',
                              currency: invoice.currency,
                              minimumFractionDigits: get(
                                organization,
                                'minimum_fraction_digits',
                                2
                              ),
                            }}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="2" className="border-top-0" />
                        <td colSpan="2" className="border-top-0 label">
                          <Trans>Tax</Trans>
                        </td>
                        <td className="text-right border-top-0">
                          <NumberFormat
                            value={invoice.taxTotal}
                            format={{
                              style: 'currency',
                              currency: invoice.currency,
                              minimumFractionDigits: get(
                                organization,
                                'minimum_fraction_digits',
                                2
                              ),
                            }}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="2" className="border-top-0" />
                        <td colSpan="2" className="label">
                          <strong>
                            <Trans>Total</Trans>
                          </strong>
                        </td>
                        <td className="text-right">
                          <strong>
                            <NumberFormat
                              value={invoice.total}
                              format={{
                                style: 'currency',
                                currency: invoice.currency,
                                minimumFractionDigits: get(
                                  organization,
                                  'minimum_fraction_digits',
                                  2
                                ),
                              }}
                            />
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                    <tbody>
                      {get(invoice, 'lineItems', []).map((lineItem, index) => (
                        <tr key={`lineItem-${index}`}>
                          <td>{index + 1}</td>
                          <td>
                            {lineItem.description}
                            {taxRates.items[lineItem.taxRate] &&
                              ` (${taxRates.items[lineItem.taxRate].percentage}% VAT)`}
                          </td>
                          <td className="min-width">{lineItem.quantity}</td>
                          <td className="min-width spaced text-right">
                            <NumberFormat
                              value={lineItem.unitPrice}
                              format={{
                                style: 'currency',
                                currency: invoice.currency,
                                minimumFractionDigits: get(
                                  organization,
                                  'minimum_fraction_digits',
                                  2
                                ),
                              }}
                            />
                          </td>
                          <td className="min-width spaced text-right">
                            <NumberFormat
                              value={lineItem.subtotal}
                              format={{
                                style: 'currency',
                                currency: invoice.currency,
                                minimumFractionDigits: get(
                                  organization,
                                  'minimum_fraction_digits',
                                  2
                                ),
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="details">
              <div className="left">
                <span className="detail-item">
                  <label>Invoice Number</label>#{('000' + get(invoice, 'number')).substr(-4)}
                </span>
                <br />
                <br />
                <span className="detail-item">
                  <label>Date Issued</label>
                  {new Date(invoice.date).toDateString()}
                </span>
                <br />
                <span className="detail-item">
                  <label>Due Date</label>
                  {new Date(invoice.due_date).toDateString()}
                </span>
                <br />
                <br />
                <span className="detail-item line-break">
                  <label>Issued to</label>
                  <strong>{get(client, 'name')}</strong>
                  {has(client, 'address') ? (
                    <span>
                      <br />
                      {get(client, 'address')}
                    </span>
                  ) : null}
                  {has(client, 'vatin') ? (
                    <span>
                      <br />
                      VAT no: {get(client, 'vatin')}
                    </span>
                  ) : null}
                </span>
              </div>
              <div className="right">
                <span className="detail-item line-break">
                  <label>Issued by</label>
                  <strong>{get(organization, 'name')}</strong>
                  {has(organization, 'address') ? (
                    <span>
                      <br />
                      {get(organization, 'address')}
                    </span>
                  ) : null}
                  {has(organization, 'vatin') ? (
                    <span>
                      <br />
                      KVK No.: {get(organization, 'registration_number')}
                    </span>
                  ) : null}
                  {has(organization, 'vatin') ? (
                    <span>
                      <br />
                      VAT No.: {get(organization, 'vatin')}
                    </span>
                  ) : null}
                  {has(organization, 'iban') ? (
                    <span>
                      <br />
                      IBAN: {get(organization, 'iban')}
                    </span>
                  ) : null}
                </span>
              </div>
            </div>
            <div className="notes">{invoice.customer_note}</div>
            <div className="footer">
              <span>
                <a href={get(organization, 'website')}>{get(organization, 'website')}</a>
              </span>
              {' • '}
              <span>
                <a href={get(organization, 'phone')}>{get(organization, 'phone')}</a>
              </span>
              {' • '}
              <span>
                <a href={get(organization, 'email')}>{get(organization, 'email')}</a>
              </span>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: 100 }}>
            <Spin />
          </div>
        )}
      </Page>
    );
  }
}

export default withRouter(
  compose(
    connect(state => {
      return {
        clients: state.clients,
        organizations: state.organizations,
        invoices: state.invoices,
        taxRates: state.taxRates,
      };
    })(Invoice)
  )
);
