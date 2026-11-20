# ServiceMinder shortcode reference

Collected on 2026-11-18 from ServiceMinder's help pages:

- Shortcodes: https://serviceminder.knowledgeowl.com/help/shortcodes
- Automated email templates: https://serviceminder.knowledgeowl.com/help/automated-email-templates

This is a summary of those pages, not a guarantee. The source page is inconsistent in places (for example `scheduled_start` and `scheduled-start` both appear). **The safest source is the shortcode picker inside ServiceMinder itself.** Never invent a shortcode; a wrong one prints as literal text in the customer's email.

## The scoping rule

Organization and Contact shortcodes work in **any** template. Every other group works only in templates of the matching type: appointment shortcodes in appointment templates, proposal shortcodes in proposal templates, invoice shortcodes in invoice templates.

## Organization (any template)

- `{organization.name}`, `{organization.email}`, `{organization.phone}`, `{organization.businessnumber}`, `{organization.service_phone}`, `{organization.textingnumber}`
- `{organization.address1}`, `{organization.address2}`, `{organization.city}`, `{organization.state}`, `{organization.zip}`
- `{organization.website}`, `{organization.selfserviceurl}` (self-scheduling link), `{organization.vcard-url}`
- Review links: `{organization.google_review_url}`, `{organization.facebook_review_url}`, `{organization.yelp_review_url}`, `{organization.bbb_review_url}`, `{organization.houzz_review_url}`, `{organization.angies_list_review_url}`, `{organization.home_advisor_review_url}`
- Social links: `{organization.facebook_url}`, `{organization.instagram_url}`, `{organization.youtube_url}`, `{organization.nextdoor_url}`, `{organization.yelp_url}`, `{organization.twitter_url}`, `{organization.pinterest_url}`, `{organization.houzz_url}`, `{organization.thumbtack_url}`, `{organization.homestars_url}`
- `{current_date}` (MM/DD/YYYY), `{logo}`, `{brand_logo}`

## Contact (any template involving a contact)

- Names: `{name}`, `{nickname}`, `{contact.name}`, `{contact.first_name}`, `{contact.last_name}`, `{contact.title}`, `{contact.companyname}`. First and last are parsed from one Name field and may not split as expected.
- Contact info: `{contact.email}`, `{contact.phone}`, `{contact.altphone}`
- Service address: `{contact.address1}`, `{contact.address2}`, `{contact.city}`, `{contact.state}`, `{contact.zip}`, `{contact.citystatezip}`, `{fullserviceaddress}` (Address 1 | City, State Zip)
- Billing address: `{contact.billingaddressname}`, `{contact.billingaddress1}`, `{contact.billingaddress2}`, `{contact.billingcity}`, `{contact.billingstate}`, `{contact.billingzip}`
- Owner: `{contact.owner_name}`, `{contact.owner_email}`, `{contact.owner_phone}`
- Dates: `{nextservicedate}`, `{lastservicedate}`
- Links: `{contact.schedule_url}` (appointments and payments summary), `{contact.statement_url}`, `{contact.update_payment_url}`, `{contact.refer_url}`, `{unsubscribe_url}`
- Next appointment: `{contact.next_appointment_link}`, `{contact.next_appointment_summary}`, `{contact.next_appointment_date}`, `{contact.next_appointment_time}`
- Next task: `{contact.next_task_link}`, `{contact.next_task_summary}`, `{contact.next_task_due}`
- Custom fields: `{contact.cust_fieldname}` (field name lowercased with spaces removed; use `appointment` in place of `contact` for appointment fields)

Note: the user's original templates use `{unsubscribe.url}` with a dot, and the built templates keep that. The docs list `{unsubscribe_url}`. Unresolved; confirm with a test send.

## Appointment (appointment-type templates only)

- Date and time: `{appointment.date}` (date and time), `{appointment.date_approximate}` (such as "Monday morning"), `{appointment.time}`, `{appointment.scheduled_start}`, `{appointment.scheduled_start_short}`, `{appointment.scheduled_start_date}`, `{appointment.duration}`, `{appointment.previous_date}`, `{appointment.nextservicedate}`
- Arrival: `{appointment.arrival_time}`, `{arrivaltime}`, `{drivetime}`, `{appointment.drivetime}`, `{appointment.drivemiles}`, `{appointment.tracking_url}` (live tracking)
- Actual times: `{appointment.actualstart}`, `{appointment.actualfinish}`, `{appointment.actualduration}`
- Service: `{service.name}`, `{service.description}`
- Agents: `{service_agent.name}` (primary), `{service_agent.names}` (everyone assigned), `{service_agent.additionalnames}` (additional agents only), `{service_agent.email}`, `{service_agent.phone}`, `{service_agent.picture}` (HTML table with photo), `{service_agent.picture_url}`, `{service_agent.bio}`, `{service_agent.license}`
- Money: `{appointment.subtotal}`, `{appointment.tax}`, `{appointment.price}`, `{appointment.total}`, `{appointment.total_paid}`, `{appointment.invoicenumber}`, `{appointment.tip_url}`
- Lists and tables: `{appointment.parts_list}`, `{appointment.options_list}`, `{appointment.selected_options_list}`, `{appointment.unselected_options_list}`, `{appointment_items_table}`, `{appointment_option_items_table}`, `{appointment_notes_table}`, `{appointment_cf_table}`
- Notes: `{appointment.customer_note}`, `{appointment.flash_message}`, `{appointment.job_number}`
- Links: `{appointment.confirm_url}`, `{appointment.ical_download_url}`, `{appointment.report_url}`, `{appointment.forms_url}`, `{appointment.communication_pref_url}`

Not available: there is no reschedule or cancel link shortcode, and no arrival-window shortcode (a window is built with filters, see below).

## Proposal (proposal-type templates only)

- `{proposal.title}`, `{proposal.subtotal}`, `{proposal.tax}`, `{proposal.total}`
- `{proposal.date}`, `{proposal.accepted_date}`, `{proposal.expiration-date}` (hyphen as printed in the docs)
- `{proposal.url}` (view and approve online), `{proposal.pdf_url}`
- `{proposal.parts_list}`, `{proposal.options_list}`, `{proposal.selected_options_list}`, `{proposal.unselected_options_list}`, `{proposal.customer_notes}`, `{proposal.job_number}`
- Owner: `{proposal.owner_name}`, `{proposal.owner_email}`, `{proposal.owner_phone}`
- Deposit: `{proposal.deposit_amount}`, `{proposal.deposit_date}`, `{proposal.deposit_payment_method}`, `{proposal.balance_due}`
- Also usable: `{service.name}`, `{service.description}`, `{appointment.duration}`, `{appointment_items_table}`, `{pricing_summary_table}`, `{url}`

## Invoice (invoice-type templates only)

- `{invoice.number}`, `{invoice.job_number}`, `{invoice.date}`, `{invoice.subtotal}`, `{invoice.tax}`, `{invoice.total}`, `{invoice.total_due}`, `{invoice.total_paid}`, `{invoice.balancedue}`, `{invoice.latest_payment_amount}`, `{invoice.notes}`, `{invoice.terms}`
- Links: `{url}` (view the invoice or receipt online; this is the only pay link), `{invoice.pdf_url}`, `{invoice.schedule_url}`
- Lists: `{invoice_items_table}`, `{invoice.parts_list}`, `{invoice.options_list}`
- Owner: `{invoice.owner_name}`, `{invoice.owner_email}`
- Receipt: `{receipt_message}` (the "Customer Message" entered when accepting payment)

## Recurring billing (needs the Email Campaigns feature)

`{recurring_billing.amount}`, `{recurring_billing.date}`, `{recurring_billing.name}` (the billing template's name, not the contact's), `{recurring_billing.service}`

## Installment payments (also accept all invoice shortcodes)

`{installment_payment_amount}`, `{installment_payment_date}`, `{message}`. Failure template only: `{failure_reason}`, `{installment_payment_retry_message}`, `{update_payment_url}`.

## Not available at all

- No membership, subscription or service-plan shortcodes (Hero Club tier and price cannot be merged in).
- No documented if/empty conditional syntax on these pages. The shortcodes page links to a "Liquid Models" reference at https://serviceminder.com/support/dotliquid, which was not read; conditionals may be covered there.

## Ad hoc emails

`{user.name}`, `{user.email}` (the staff member sending the email)

## Filters

Syntax is `{shortcode|filter}`, with parameters separated by colons and filters chained with `|`.

Filters listed: `short_date` (mm/dd/yyyy), `short_time` (h:mm tt), `friendly`, `friendly_date`, `addtime`, `duration`, `downcase`, `upcase`, `titlecase`, `replace`, `markdown`, `strip_newline`, `html-encode`, `url-encode`, `xml_encode`, `to_utc`.

Arrival-window example from the docs:

```
{appointment.scheduled-start|addtime:-1:hour|short_time} - {appointment.scheduled-start|addtime:1:hour|short_time}
```

## Automated email template types

The docs list these (and say "most" are listed, so there may be more):

| Template type | When it sends | Shortcode groups |
|---|---|---|
| Appointment Confirmation | Appointment scheduled or modified | Appointment, Contact, Organization |
| Appointment Complete | Appointment marked finished | Appointment, Contact, Organization |
| Appointment Renewal | At 90% of the service interval | Appointment, Contact, Organization |
| Service Agent En Route | Agent marks themselves on the way | Appointment en-route shortcodes (not stated in docs) |
| Contact Proposal | Proposal emailed | Proposal, Contact, Organization |
| Proposal Reminder | Automatic reminder for open proposals | Proposal, Contact, Organization |
| Proposal Confirmation | Proposal accepted | Proposal (not stated in docs) |
| Proposal Update | Deposit applied to a proposal | Proposal (not stated in docs) |
| Contact Invoice | Invoice created and emailed | Invoice, Contact, Organization |
| Invoice Reminder | Automatic reminder for open invoices | Invoice, Contact, Organization |
| Contact Receipt | Invoice paid in full | Invoice receipt shortcodes (not stated in docs) |
| Installment Payment Success / Reminder / Failure | Installment events | Installment, Invoice, Contact, Organization |
| Statement Ready Notification | Consolidated payments day | Not stated |
| Contact Reset Password | Account invite or lost password | Not stated |

There is no "rescheduled" template: moving an appointment re-sends Appointment Confirmation.

## Shortcodes used in the current templates

| Template | Shortcodes |
|---|---|
| service-complete | `contact.first_name`, `fullserviceaddress`, `appointment.parts_list`, `appointment.actualfinish`, `service_agent.names`, `organization.phone`, `organization.name` |
| commercial-proposal | `contact.first_name`, `proposal.title`, `fullserviceaddress`, `proposal.parts_list`, `proposal.total`, `proposal.expiration-date\|short_date`, `proposal.url`, `proposal.pdf_url`, `proposal.owner_name`, `organization.email`, `organization.phone` |
| residential-proposal | as commercial, without `proposal.title` |
| appointment-confirmation | `contact.first_name`, `appointment.confirm_url`, `appointment.ical_download_url`, `appointment.date`, `fullserviceaddress`, `appointment.parts_list`, `appointment.duration`, `service_agent.names`, `organization.phone` |
| appointment-reminder | `contact.first_name`, `contact.next_appointment_link`, `contact.next_appointment_date`, `contact.next_appointment_time`, `contact.next_appointment_summary`, `fullserviceaddress`, `organization.name`, `organization.phone` |
| on-our-way | `contact.first_name`, `service_agent.name`, `service_agent.names`, `appointment.tracking_url`, `appointment.arrival_time`, `drivetime`, `fullserviceaddress`, `organization.phone` |
| reschedule-notice | `contact.first_name`, `contact.next_appointment_date`, `contact.next_appointment_time`, `contact.next_appointment_summary`, `contact.next_appointment_link`, `fullserviceaddress`, `organization.phone` |
| proposal-follow-up | `contact.first_name`, `fullserviceaddress`, `proposal.parts_list`, `proposal.total`, `proposal.expiration-date\|short_date`, `proposal.url`, `proposal.pdf_url`, `proposal.owner_name`, `organization.email`, `organization.phone` |
| invoice | `contact.first_name`, `url`, `invoice.pdf_url`, `invoice.number`, `invoice.date`, `fullserviceaddress`, `invoice.parts_list`, `invoice.total`, `invoice.balancedue`, `organization.name`, `organization.phone` |
| receipt | `contact.first_name`, `url`, `invoice.number`, `invoice.latest_payment_amount`, `invoice.total_paid`, `invoice.balancedue`, `receipt_message`, `organization.name`, `organization.phone` |
| hero-club-welcome | `contact.first_name`, `contact.schedule_url`, `contact.update_payment_url`, `organization.name`, `organization.phone` |

Every template also uses `{unsubscribe.url}` in the footer.
