// Runs each time Netlify accepts a submission to the "hero-club-lead" form
// and adds it to the "Hero Club Requests" board on monday.com.
//
// Needs one environment variable on the Netlify project:
//   MONDAY_API_TOKEN  a monday.com API token that can add items to the board
//
// If the token is missing or monday.com rejects the item, the request is still
// safe: it stays in Netlify Forms and the email notification still goes out.

const BOARD_ID = '18440849405';
const FORM_NAME = 'hero-club-lead';

// Column ids on the Hero Club Requests board.
const COL = {
  status: 'color_mm99q891',
  plan: 'text_mm99xq3t',
  homeSize: 'text_mm99fbpn',
  price: 'text_mm99dgj',
  addons: 'text_mm99g3m5',
  phone: 'phone_mm99jstd',
  email: 'email_mm99vr8c',
  address: 'text_mm99h8pv',
  city: 'text_mm993tqv',
  state: 'text_mm99zyjk',
  zip: 'text_mm99q1ys',
  notes: 'long_text_mm99wj3g',
};

const clean = (v) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim();

function buildColumnValues(d) {
  const values = {
    [COL.status]: { label: 'New' },
    [COL.plan]: clean(d.tier),
    [COL.homeSize]: clean(d['home-size']),
    [COL.price]: clean(d.price),
    [COL.addons]: clean(d.addons) || 'None',
    [COL.address]: clean(d.address),
    [COL.city]: clean(d.city),
    [COL.state]: clean(d.state).toUpperCase(),
    [COL.zip]: clean(d.zip),
  };

  // monday wants digits only, with an optional leading +
  let digits = clean(d.phone).replace(/\D/g, '');
  if (digits.length === 10) digits = '1' + digits;
  if (digits.length >= 10 && digits.length <= 15) {
    values[COL.phone] = { phone: '+' + digits, countryShortName: 'US' };
  }

  const email = clean(d.email);
  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    values[COL.email] = { email, text: email };
  }

  const notes = String(d.notes == null ? '' : d.notes).trim();
  if (notes) values[COL.notes] = { text: notes };

  return values;
}

exports.buildColumnValues = buildColumnValues;

exports.handler = async (event) => {
  let payload;
  try {
    payload = JSON.parse(event.body).payload;
  } catch (err) {
    console.error('Could not read the submission:', err.message);
    return { statusCode: 200, body: 'ignored' };
  }
  if (!payload || payload.form_name !== FORM_NAME) return { statusCode: 200, body: 'ignored' };

  const token = process.env.MONDAY_API_TOKEN;
  if (!token) {
    console.error('MONDAY_API_TOKEN is not set, so this request was not added to monday.com.');
    return { statusCode: 200, body: 'no token' };
  }

  const d = payload.data || {};
  const name = clean(d.name) || 'Hero Club request';
  const query = `mutation ($board: ID!, $name: String!, $cols: JSON!) {
    create_item(board_id: $board, item_name: $name, column_values: $cols, create_labels_if_missing: true) { id }
  }`;

  try {
    const res = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify({
        query,
        variables: { board: BOARD_ID, name, cols: JSON.stringify(buildColumnValues(d)) },
      }),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || out.errors) {
      console.error('monday.com did not accept the request:', res.status, JSON.stringify(out.errors || out));
      return { statusCode: 200, body: 'monday error' };
    }
    console.log('Added to monday.com as item', out.data && out.data.create_item && out.data.create_item.id);
    return { statusCode: 200, body: 'ok' };
  } catch (err) {
    console.error('Could not reach monday.com:', err.message);
    return { statusCode: 200, body: 'monday unreachable' };
  }
};
