///////////////////// CurrentStatus


var CurrentStatus = React.createClass({

  render: function() {
    return (
      <div className="reading__curent-status">
        <div className="reading__curent-status__text">
          should say: {this.props.text}
        </div>
        <div className="reading__curent-status__speech">
          should said: {this.props.speech}
        </div>
      </div>
    );
  }

});


///////////////////// Word

var Word = React.createClass({
  getInitialState: function() {
    return { current: false };
  },

  toggleCurrentWord: function(isCurrent) {
    this.setState({ current: isCurrent });
  },

  render: function() {
    var classes = React.addons.classSet({
      'reading__word': true,
      'reading__word--current': this.props.current
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
      currentWordIdx: 0
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

  // only here for testing
  handleClick: function(e) {
    this.setState({ currentWordIdx: this.state.currentWordIdx += 1 });
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
    this.setState({ currentSpeech: text });
    this.forceUpdate();
  },

  handleSpeechInput: function(text) {
    // console.log('handleSpeechInput');
    // console.log(text);
    text = text.trim();
    var words = text.split(' ');

    this.setState({ currentSpeech: text });
    this.forceUpdate();

    // TODO do stuff here
    var i = 0;
    words.forEach(function(word) {
      if (this.compareToCurrent_(word)) {
        this.setState({ currentWordIdx: this.state.currentWordIdx += 1 });
        this.forceUpdate();
      }

    }, this);
  },

  // helper
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
      return [
        <Word text={word} current={ idx === this.state.currentWordIdx }/>,
        <span> </span>
      ]
    }, this);

    var currentWordText = wordNodes.length ? this.state.data[this.state.currentWordIdx] : '';
    var currentSpeech = this.state.currentSpeech;

    return (
      <div className='reading-container'>
        <div className='reading' onClick={this.handleClick}>
          { wordNodes }
        </div>
        <CurrentStatus text={currentWordText} speech={currentSpeech} />
      </div>
    );
  }

});

///////////////////// Init
///////////////////// init speech recongition
var recognition_ = new webkitSpeechRecognition();
recognition_.continuous = true;
recognition_.interimResults = true;

React.render(
  <Reading url='mock_data/pride_and_prejudice_1.json' recognition={recognition_}/>,
  document.getElementById('content')
);


