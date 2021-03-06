///////////////////// constants

var Constants = {
  // word result states
  CORRECT: 'correct',
  INCORRECT: 'incorrect',
  SKIPPED: 'skipped',

  // speach input states
  INTERIM: 'interim',
  FINAL: 'final'
}


///////////////////// CurrentStatus

var CurrentStatus = React.createClass({
  render: function() {
    var speechClasses = React.addons.classSet({
      'reading__curent-status__speech': true,
      'reading__curent-status__speech--interim': this.props.speechStatus === Constants.INTERIM,
      'reading__curent-status__speech--final': this.props.speechStatus === Constants.FINAL
    });

    var currentSpeechInput = this.props.speech || '...';

    return (
      <div className="reading__curent-status">
        <div className={ speechClasses }>
          <div className="reading__curent-status__speech__prompt">
            you said:
          </div>
          <div className="reading__curent-status__speech__input">
            {currentSpeechInput}
          </div>
        </div>
      </div>
    );
  }
});


///////////////////// Word

var Word = React.createClass({
  getInitialState: function() {
    return {
      current: false,
      state: ''
    };
  },

  render: function() {
    var classes = React.addons.classSet({
      'reading__word': true,
      'reading__word--current': this.props.current,
      'reading__word--correct': this.props.state === Constants.CORRECT,
      'reading__word--incorrect': this.props.state === Constants.INCORRECT,
      'reading__word--skipped': this.props.state === Constants.SKIPPED,
    });

    return (
      <span className={ classes }>
          { this.props.text}
      </span>
    );
  }

});


///////////////////// Reading

var Reading = React.createClass({
  getInitialState: function() {
    return {
      data: [],
      currentWordIdx: 0,
      wordStates: {}
    };
  },

  componentDidMount: function() {
    this.loadCommentsFromServer();
    this.initSpeechRecognition();
  },

  initSpeechRecognition: function() {
    var recognition = this.props.recognition;
    recognition.onresult = this.handleSpeechResult;
    recognition.start();
  },

  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: this.handleLoadSuccess.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  handleLoadSuccess: function(data) {
    this.setState({data: data.snippets[0].text.split(' ')});
  },

  // used to skip a word
  handleClickSkipWord: function(e) {
    this.skipCurrentWord();
  },

  handleClickAllDone: function(e) {
    var allWordStates = this.state.wordStates;  // words user attempted
    var allWordStatesKeys = Object.keys(allWordStates);

    // calculate totals
    var totalAttempted = allWordStatesKeys.length;
    var totalWords = this.state.data.length;
    var totalUnattempted = totalWords - totalAttempted;  // check for words completely skipped via 'all done'

    var resultBuckets = {}
    resultBuckets[Constants.CORRECT] = 0;
    resultBuckets[Constants.INCORRECT] = 0;
    resultBuckets[Constants.SKIPPED] = 0;
    resultBuckets.unattempted = totalUnattempted;

    allWordStatesKeys.forEach(function(wordStateKey) {
      resultBuckets[this[wordStateKey]] += 1;
    }, allWordStates);

    function safePercent(amount, total) {
      raw = total ? ((amount/total) * 100) : 0;
      return Math.round(raw * 10) / 10;
    }

    var totalCorrect = resultBuckets[Constants.CORRECT]
    var attemptedScore = safePercent(totalCorrect, totalAttempted);
    var overallScore = safePercent(totalCorrect, totalWords);

    // DEBUG
    console.log('results:');
    console.log('total:', totalWords);
    console.log('total attempted:', totalAttempted);
    console.log('total unattempted:', totalUnattempted);
    console.log('correct:', resultBuckets[Constants.CORRECT]);
    console.log('incorrect:', resultBuckets[Constants.INCORRECT]);
    console.log('skipped:', resultBuckets[Constants.SKIPPED]);

    console.log('attempted score:', attemptedScore);
    console.log('overall score:', overallScore);


    msg_partials = [
      'Congrats!',
      'You attempted ' + totalAttempted + ' of ' + totalWords + ' words and ' + 'got ' + totalCorrect + ' correct.',
      'Your attempted score is ' + attemptedScore + '% and your overall score is ' + overallScore + '%.'
    ]

    alert(msg_partials.join('\n\n'));

  },

  handleSpeechResult: function(e) {
    for (var i = event.resultIndex; i < event.results.length; i += 1) {
      var result = event.results[i];
      var transcript = result[0].transcript;
      if (result.isFinal) {
        this.handleSpeechInput(transcript);
      } else {
        this.handleInteriumSpeechInput(transcript);
      }
    }
  },

  handleInteriumSpeechInput: function(text) {
    text = text.trim();
    this.setState({
      currentSpeech: text,
      speechStatus: Constants.INTERIM
    });
  },

  handleSpeechInput: function(text) {
    text = text.trim();
    var words = text.split(' ');

    this.setState({
      currentSpeech: text,
      speechStatus: Constants.FINAL
    });

    words.forEach(function(word) {
      if (this.compareToCurrent_(word)) {
        this.setCurrentWordCorrect();
        return;
      }

      this.setCurrentWordIncorrect();
    }, this);
  },

  setCurrentWordCorrect: function() {
    this.setCurrentWordState(Constants.CORRECT);
    this.moveToNextWord();
  },

  setCurrentWordIncorrect: function() {
    this.setCurrentWordState(Constants.INCORRECT);
  },

  skipCurrentWord: function() {
    this.setCurrentWordState(Constants.SKIPPED);
    this.moveToNextWord();
  },

  setCurrentWordState: function(state) {
    var currentWordState = this.state.wordStates;
    currentWordState[this.state.currentWordIdx] = state;
    this.setState({ wordStates: currentWordState });
  },

  // helpers
  moveToNextWord: function() {
    // check if we're done here
    if (this.state.currentWordIdx === this.state.data.length - 1) {
      this.handleClickAllDone();
      return;
    }

    this.setState({ currentWordIdx: this.state.currentWordIdx += 1 });
  },

  formatWordForComparison: function(word) {
    return word.replace(/\W/g, '').toLowerCase();
  },

  compareToCurrent_: function(word) {
    return this.formatWordForComparison(word) === this.formatWordForComparison(this.currentWordText_());
  },

  currentWordText_: function() {
    return this.state.data.length ? this.state.data[this.state.currentWordIdx]: '';
  },

  render: function() {
    var wordNodes = this.state.data.map(function(word, idx) {
      var isCurrent = idx === this.state.currentWordIdx;
      var nodeState = this.state.wordStates[idx];

      return [
        <Word text={word} current={ isCurrent } state={ nodeState } />,
        <span> </span>
      ]
    }, this);

    var currentSpeech = this.state.currentSpeech;

    return (
      <div className='reading-container'>
        <div className='reading'>
          { wordNodes }
        </div>
        <CurrentStatus speech={currentSpeech} speechStatus={ this.state.speechStatus } />
        <div className='reading-controls'>
          <div className='reading-control__button reading-control__button--done' onClick={this.handleClickAllDone}>
            All Done
          </div>
          <div className='reading-control__button reading-control__button--skip-word' onClick={this.handleClickSkipWord}>
            Skip Word
          </div>
        </div>
      </div>
    );
  }
});


///////////////////// init speech recongition
var recognition_ = new webkitSpeechRecognition();
recognition_.continuous = true;
recognition_.interimResults = true;

React.render(
  // TODO real data
  <Reading url='mock_data/pride_and_prejudice_1.json' recognition={recognition_}/>,
  document.getElementById('content')
);


