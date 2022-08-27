import { shuffle } from "lodash";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { openFullscreen, closeFullscreen } from "./fullscreen";
// import { movies } from "./movies";
// import { timesUpFr } from "./timesUpFr";
import { gamewords } from "./gamewords";
// import aTrue from "./true.mp3";
import aTrue from "./true.m4a";
// import aFalse from "./false.mp3";
import aFalse from "./false.m4a";

const parseGameWords = () => {
  const all = {};
  Object.keys(gamewords).forEach((key) => {
    Object.entries(gamewords[key]).forEach(([key2, data]) => {
      all[`${key} - ${key2}`] = data;
    });
  });

  return {
    gameWordsData: all,
    gameWordsNames: Object.keys(all).reduce(
      (acc, curr) => ({ ...acc, [curr]: curr }),
      {}
    ),
  };
};

const { gameWordsData, gameWordsNames } = parseGameWords();

const deckData = {
  //movies,
  //timesUpFr,
  ...gameWordsData,
};

const deckNames = {
  //movies: "movies",
  //timesUpFr: "time's up (fr)",
  ...gameWordsNames,
};

const decks = Object.values(deckNames);

const CARDS = Object.entries(deckNames).reduce(
  (acc, [key, val]) => ({ ...acc, [val]: deckData[key] }),
  {}
);

const App = () => {
  const [started, setStarted] = useState(false);
  const start = () => setStarted(true);
  const end = () => setStarted(false);
  const [cards, setCards] = useState([]);

  const startGame = (deck) => {
    setCards(shuffle(CARDS[deck]));
    start();
  };

  return started ? (
    <Game end={end} cards={cards} />
  ) : (
    <Home start={startGame} />
  );
};

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Decks = ({ onChange, selected }) => {
  return (
    <select value={selected} onChange={onChange}>
      {decks.map((deck) => (
        <option key={deck} value={deck}>
          {deck.toUpperCase()}
        </option>
      ))}
    </select>
  );
};

const Home = ({ start }) => {
  const [deck, setDeck] = useState(decks[0]);

  return (
    <HomeContainer>
      <h1>HEADS UP (GFG Version)</h1>
      <Decks selected={deck} onChange={(e) => setDeck(e.target.value)} />
      <button onClick={openFullscreen}>Go full screen</button>
      <button onClick={closeFullscreen}>Close full screen</button>
      <button onClick={() => start(deck)}>Start</button>
    </HomeContainer>
  );
};

const Results = ({ cards, end }) => {
  var count = 0;
  cards.forEach(({ complete, name }) => {
    count += complete ? 1 : 0;
  });

  return (
    <>
      <ul>
        {cards.map(({ complete, name }) => {
          return (
            <li style={{ color: complete ? "green" : "red" }} key={name}>
              {name}
            </li>
          );
        })}
      </ul>
      <text style={{ margin: 25, color: "green", fontSize: 30 }}>
        TOTAL: {count}
      </text>
      <button onClick={end}>End</button>
    </>
  );
};

const Game = ({ end, cards }) => {
  const [done, setDone] = useState(false);
  const [previous, setPrevious] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [name, setName] = useState("");
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    let interval = null;
    if (seconds === 0) {
      setDone(true);
    }
    interval = setInterval(() => {
      setSeconds((seconds) => seconds - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  useEffect(() => {
    const nextCard = cards[cardIndex];
    if (!nextCard) {
      setDone(true);
    } else {
      setName(cards[cardIndex]);
    }
  }, [cards, cardIndex]);

  const pass = () => {
    setPrevious([...previous, { name, complete: false }]);
    setCardIndex(cardIndex + 1);

    // play sounds
    const playAudio = () => {
      new Audio(aFalse).play();
    };

    playAudio();
  };

  const accept = () => {
    setPrevious([...previous, { name, complete: true }]);
    setCardIndex(cardIndex + 1);

    // play sounds
    const playAudio = () => {
      new Audio(aTrue).play();
    };

    playAudio();
  };

  if (done) {
    return (
      <Results
        end={end}
        cards={[...previous, { name: cards[cardIndex], complete: false }]}
      />
    );
  }

  return (
    <UI time={seconds} card={cards[cardIndex]} pass={pass} accept={accept} />
  );
};

const UIContainer = styled.div`
  display: flex;
  height: 100vh;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
`;

const BaseButton = styled.button`
  flex: 1;
  margin-top: 0;
  margin-bottom: 0;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PassButton = styled(BaseButton)`
  background: #f47373;
`;

const AcceptButton = styled(BaseButton)`
  background: #37d67a;
`;

const MainContainer = styled.div`
  flex: 2;
  flex-direction: column;
  display: flex;
  align-items: center;
  background: #697689;
`;

const Clock = ({ time }) => {
  return <h3>{time}</h3>;
};

const UI = ({ pass, accept, card, time }) => {
  return (
    <UIContainer>
      <PassButton style={{ fontSize: 60 }} onClick={pass}>
        Sai/Bỏ qua
      </PassButton>
      <MainContainer>
        <Clock time={time} />
        <Card name={card} />
        <Clock time={time} />
      </MainContainer>
      <AcceptButton style={{ fontSize: 60 }} onClick={accept}>
        Đúng
      </AcceptButton>
    </UIContainer>
  );
};

const Card = ({ name }) => {
  return <h1 style={{ fontSize: 60 }}>{name}</h1>;
};

export default App;
