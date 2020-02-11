import React from "react";
import { Rate, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons";

import "./scoring-board.css";

const CODING_EXPERIENCE_TIP = (
  <p>
    Learners: Base this on experience with Python or similar languages.
    <br />
    <br />
    Competitors: Base this on their experience with any data science related
    language (Python / R) and libraries (Pandas / Matplotlib)
  </p>
);
const DS_EXPERIENCE_TIP = (
  <p>
    Learners: We're mainly looking for interest in Data Science, but a little
    bit of previous experience is helpful. Too much experience might mean that
    they'd get bored.
    <br />
    <br />
    Competitors: We're looking for a good amount of experience and previous work
    in Data Science. Classes are good, work experience is great. We need to make
    sure that competitors are good enough to work on our sponsors' datasets.
  </p>
);
const CULTURE_FIT_TIP = (
  <p>
    This is pretty subjective, but can be based off of their excitement to
    attend the Datathon. This will be reflected off their responses to our
    'Experience' and 'Expectation' questions.
  </p>
);
const IS_STEM_TIP = <p>Whether the applicant is a STEM major.</p>;

const MAX_SCORE = 3;

const DEFAULT_APPLICANT_SCORES = {
  coding_exp: 0,
  ds_exp: 0,
  culture_fit: 0,
  is_stem: 0
};

class ScoringBoard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      scores:
        props.scores == undefined ? DEFAULT_APPLICANT_SCORES : this.props.scores
    };
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      ...this.state,
      scores:
        newProps.scores == undefined
          ? DEFAULT_APPLICANT_SCORES
          : newProps.scores
    });
  }

  changeApplicantScore(scoreType, score) {
    let { scores } = this.state;
    scores[scoreType] = score;
    this.setState({
      ...this.state,
      scores
    });
  }

  render() {
    return (
      <div className="row justify-content-center selection-buttons-div">
        <span className="score-block">
          <h5 className="score-block-heading">
            Coding Experience:
            <Tooltip title={CODING_EXPERIENCE_TIP}>
              <FontAwesomeIcon
                icon={faQuestionCircle}
                className="score-block-tooltip"
              />
            </Tooltip>
          </h5>
          <Rate
            onChange={score => this.changeApplicantScore("coding_exp", score)}
            allowClear
            count={MAX_SCORE}
            value={this.state.scores["coding_exp"]}
          />
        </span>
        <span className="score-block">
          <h5 className="score-block-heading">
            Data Science Experience:
            <Tooltip title={DS_EXPERIENCE_TIP}>
              <FontAwesomeIcon
                icon={faQuestionCircle}
                className="score-block-tooltip"
              />
            </Tooltip>
          </h5>
          <Rate
            onChange={score => this.changeApplicantScore("ds_exp", score)}
            allowClear
            count={MAX_SCORE}
            value={this.state.scores["ds_exp"]}
          />
        </span>
        <span className="score-block">
          <h5 className="score-block-heading">
            Culture Fit:
            <Tooltip title={CULTURE_FIT_TIP}>
              <FontAwesomeIcon
                icon={faQuestionCircle}
                className="score-block-tooltip"
              />
            </Tooltip>
          </h5>
          <Rate
            onChange={score => this.changeApplicantScore("culture_fit", score)}
            allowClear
            count={MAX_SCORE}
            value={this.state.scores["culture_fit"]}
          />
        </span>
        <span className="score-block">
          <h5 className="score-block-heading">
            Is STEM:
            <Tooltip title={IS_STEM_TIP}>
              <FontAwesomeIcon
                icon={faQuestionCircle}
                className="score-block-tooltip"
              />
            </Tooltip>
          </h5>
          <Rate
            onChange={score => this.changeApplicantScore("is_stem", score)}
            allowClear
            count={1}
            value={this.state.scores["is_stem"]}
          />
        </span>
      </div>
    );
  }
}

export default ScoringBoard;
