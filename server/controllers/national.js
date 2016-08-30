import NationalPage from '../pages/national-page';
import { render } from '../nunjucks';

export default (req, res) => {
  const page = new NationalPage();
  res.send(render('national.html', page));
};
