// Public Domain Biblical Canon (66 Books: 39 Old Testament, 27 New Testament)
// Christ-Centered, Evangelical / Biblical Christian Faith

export interface BibleBookMeta {
  id: string;
  name: string;
  testament: "OT" | "NT";
  category:
    | "Law"
    | "History"
    | "Poetry & Wisdom"
    | "Major Prophets"
    | "Minor Prophets"
    | "Gospels"
    | "Acts"
    | "Pauline Epistles"
    | "General Epistles"
    | "Prophecy";
  chaptersCount: number;
  theme: string;
}

export interface BibleVerseItem {
  verse: number;
  text: string;
}

export interface BibleChapterData {
  book: string;
  chapter: number;
  translation: string;
  verses: BibleVerseItem[];
}

export const BIBLE_BOOKS: BibleBookMeta[] = [
  // Old Testament (39 Books)
  { id: "GEN", name: "Genesis", testament: "OT", category: "Law", chaptersCount: 50, theme: "Creation, the Fall, and God's Covenant Promises" },
  { id: "EXO", name: "Exodus", testament: "OT", category: "Law", chaptersCount: 40, theme: "Redemption from bondage and God's Holy Presence" },
  { id: "LEV", name: "Leviticus", testament: "OT", category: "Law", chaptersCount: 27, theme: "Holiness and atonement pointing to Christ" },
  { id: "NUM", name: "Numbers", testament: "OT", category: "Law", chaptersCount: 36, theme: "God's faithfulness during wilderness wandering" },
  { id: "DEU", name: "Deuteronomy", testament: "OT", category: "Law", chaptersCount: 34, theme: "Loving and obeying the Lord with all your heart" },
  { id: "JOS", name: "Joshua", testament: "OT", category: "History", chaptersCount: 24, theme: "Entering the promised inheritance in faith" },
  { id: "JDG", name: "Judges", testament: "OT", category: "History", chaptersCount: 21, theme: "God's mercy delivering His wayward people" },
  { id: "RUT", name: "Ruth", testament: "OT", category: "History", chaptersCount: 4, theme: "Kinsman-Redeemer foreshadowing Christ" },
  { id: "1SA", name: "1 Samuel", testament: "OT", category: "History", chaptersCount: 31, theme: "The rise of the kingdom and David's heart for God" },
  { id: "2SA", name: "2 Samuel", testament: "OT", category: "History", chaptersCount: 24, theme: "God's everlasting covenant with David" },
  { id: "1KI", name: "1 Kings", testament: "OT", category: "History", chaptersCount: 22, theme: "Solomon's temple and prophetic warnings" },
  { id: "2KI", name: "2 Kings", testament: "OT", category: "History", chaptersCount: 25, theme: "Kingdom division, exile, and God's sovereignty" },
  { id: "1CH", name: "1 Chronicles", testament: "OT", category: "History", chaptersCount: 29, theme: "Priestly record of David's worship and lineage" },
  { id: "2CH", name: "2 Chronicles", testament: "OT", category: "History", chaptersCount: 36, theme: "Revival, repentance, and the temple of God" },
  { id: "EZR", name: "Ezra", testament: "OT", category: "History", chaptersCount: 10, theme: "Restoration of worship and rebuilding God's house" },
  { id: "NEH", name: "Nehemiah", testament: "OT", category: "History", chaptersCount: 13, theme: "Rebuilding Jerusalem's walls with prayer and resolve" },
  { id: "EST", name: "Esther", testament: "OT", category: "History", chaptersCount: 10, theme: "God's hidden providence delivering His people" },
  { id: "JOB", name: "Job", testament: "OT", category: "Poetry & Wisdom", chaptersCount: 42, theme: "Trusting God's sovereignty through suffering" },
  { id: "PSA", name: "Psalms", testament: "OT", category: "Poetry & Wisdom", chaptersCount: 150, theme: "Praise, prayer, lament, and messianic songs" },
  { id: "PRO", name: "Proverbs", testament: "OT", category: "Poetry & Wisdom", chaptersCount: 31, theme: "The fear of the Lord is the beginning of wisdom" },
  { id: "ECC", name: "Ecclesiastes", testament: "OT", category: "Poetry & Wisdom", chaptersCount: 12, theme: "Life under the sun vs. finding purpose in God alone" },
  { id: "SNG", name: "Song of Solomon", testament: "OT", category: "Poetry & Wisdom", chaptersCount: 8, theme: "Sacred love reflecting Christ and His bride" },
  { id: "ISA", name: "Isaiah", testament: "OT", category: "Major Prophets", chaptersCount: 66, theme: "The Holy One of Israel and the Suffering Servant" },
  { id: "JER", name: "Jeremiah", testament: "OT", category: "Major Prophets", chaptersCount: 52, theme: "The New Covenant written upon human hearts" },
  { id: "LAM", name: "Lamentations", testament: "OT", category: "Major Prophets", chaptersCount: 5, theme: "Great is Thy faithfulness; His mercies are new every morning" },
  { id: "EZK", name: "Ezekiel", testament: "OT", category: "Major Prophets", chaptersCount: 48, theme: "God's glory and a new heart of flesh" },
  { id: "DAN", name: "Daniel", testament: "OT", category: "Major Prophets", chaptersCount: 12, theme: "God's eternal kingdom over all earthly rulers" },
  { id: "HOS", name: "Hosea", testament: "OT", category: "Minor Prophets", chaptersCount: 14, theme: "God's relentless steadfast love and redemption" },
  { id: "JOL", name: "Joel", testament: "OT", category: "Minor Prophets", chaptersCount: 3, theme: "The outpouring of the Holy Spirit and the Day of the Lord" },
  { id: "AMO", name: "Amos", testament: "OT", category: "Minor Prophets", chaptersCount: 9, theme: "Let justice roll down like waters and righteousness like a stream" },
  { id: "OBA", name: "Obadiah", testament: "OT", category: "Minor Prophets", chaptersCount: 1, theme: "Judgment upon pride and triumph of God's kingdom" },
  { id: "JON", name: "Jonah", testament: "OT", category: "Minor Prophets", chaptersCount: 4, theme: "God's grace reaching all nations; sign of Christ's resurrection" },
  { id: "MIC", name: "Micah", testament: "OT", category: "Minor Prophets", chaptersCount: 7, theme: "The Messiah born in Bethlehem who pardons iniquity" },
  { id: "NAH", name: "Nahum", testament: "OT", category: "Minor Prophets", chaptersCount: 3, theme: "The Lord is good, a stronghold in the day of trouble" },
  { id: "HAB", name: "Habakkuk", testament: "OT", category: "Minor Prophets", chaptersCount: 3, theme: "The just shall live by his faith; rejoicing in God our strength" },
  { id: "ZEP", name: "Zephaniah", testament: "OT", category: "Minor Prophets", chaptersCount: 3, theme: "The Lord in your midst will rejoice over you with singing" },
  { id: "HAG", name: "Haggai", testament: "OT", category: "Minor Prophets", chaptersCount: 2, theme: "Consider your ways; Christ the Desire of all nations" },
  { id: "ZEC", name: "Zechariah", testament: "OT", category: "Minor Prophets", chaptersCount: 14, theme: "The King coming humble upon a donkey, pierced for us" },
  { id: "MAL", name: "Malachi", testament: "OT", category: "Minor Prophets", chaptersCount: 4, theme: "The Sun of Righteousness rising with healing in His wings" },

  // New Testament (27 Books)
  { id: "MAT", name: "Matthew", testament: "NT", category: "Gospels", chaptersCount: 28, theme: "Jesus the promised Messiah, King of kings" },
  { id: "MRK", name: "Mark", testament: "NT", category: "Gospels", chaptersCount: 16, theme: "Jesus the Servant of God who gave His life as a ransom for many" },
  { id: "LUK", name: "Luke", testament: "NT", category: "Gospels", chaptersCount: 24, theme: "The Son of Man who came to seek and to save the lost" },
  { id: "JHN", name: "John", testament: "NT", category: "Gospels", chaptersCount: 21, theme: "Jesus is God the Word made flesh; eternal life through faith in Him" },
  { id: "ACT", name: "Acts", testament: "NT", category: "Acts", chaptersCount: 28, theme: "The Holy Spirit empowering the Church to preach Christ to all nations" },
  { id: "ROM", name: "Romans", testament: "NT", category: "Pauline Epistles", chaptersCount: 16, theme: "Justification by grace through faith in Christ alone" },
  { id: "1CO", name: "1 Corinthians", testament: "NT", category: "Pauline Epistles", chaptersCount: 16, theme: "The cross of Christ, unity, love, and the resurrection" },
  { id: "2CO", name: "2 Corinthians", testament: "NT", category: "Pauline Epistles", chaptersCount: 13, theme: "God's strength perfected in weakness; ministry of reconciliation" },
  { id: "GAL", name: "Galatians", testament: "NT", category: "Pauline Epistles", chaptersCount: 6, theme: "Freedom in Christ; not justified by works of the law" },
  { id: "EPH", name: "Ephesians", testament: "NT", category: "Pauline Epistles", chaptersCount: 6, theme: "Saved by grace through faith; alive in Christ and the armour of God" },
  { id: "PHP", name: "Philippians", testament: "NT", category: "Pauline Epistles", chaptersCount: 4, theme: "Rejoice in the Lord always; Christ our life and strength" },
  { id: "COL", name: "Colossians", testament: "NT", category: "Pauline Epistles", chaptersCount: 4, theme: "The supremacy and deity of Christ: In Him dwells all the fullness of the Godhead" },
  { id: "1TH", name: "1 Thessalonians", testament: "NT", category: "Pauline Epistles", chaptersCount: 5, theme: "Living in holiness and the blessed return of Jesus Christ" },
  { id: "2TH", name: "2 Thessalonians", testament: "NT", category: "Pauline Epistles", chaptersCount: 3, theme: "Standing firm in the Lord until His appearing" },
  { id: "1TI", name: "1 Timothy", testament: "NT", category: "Pauline Epistles", chaptersCount: 6, theme: "Sound doctrine; one God and one mediator between God and men: Christ Jesus" },
  { id: "2TI", name: "2 Timothy", testament: "NT", category: "Pauline Epistles", chaptersCount: 4, theme: "All Scripture is God-breathed; enduring hardship for the gospel" },
  { id: "TIT", name: "Titus", testament: "NT", category: "Pauline Epistles", chaptersCount: 3, theme: "Waiting for the blessed hope and glorious appearing of our great God and Savior Jesus Christ" },
  { id: "PHM", name: "Philemon", testament: "NT", category: "Pauline Epistles", chaptersCount: 1, theme: "Forgiveness, brotherly love, and reconciliation in Christ" },
  { id: "HEB", name: "Hebrews", testament: "NT", category: "General Epistles", chaptersCount: 13, theme: "Jesus our supreme High Priest; come boldly unto the throne of grace" },
  { id: "JAS", name: "James", testament: "NT", category: "General Epistles", chaptersCount: 5, theme: "Living, practical faith producing good fruit and perseverance" },
  { id: "1PE", name: "1 Peter", testament: "NT", category: "General Epistles", chaptersCount: 5, theme: "Living hope through Christ's resurrection and standing firm in trials" },
  { id: "2PE", name: "2 Peter", testament: "NT", category: "General Epistles", chaptersCount: 3, theme: "Growing in the grace and knowledge of our Lord and Savior Jesus Christ" },
  { id: "1JN", name: "1 John", testament: "NT", category: "General Epistles", chaptersCount: 5, theme: "God is light and love; assurance of eternal life through the Son" },
  { id: "2JN", name: "2 John", testament: "NT", category: "General Epistles", chaptersCount: 1, theme: "Walking in truth and obeying God's commandments" },
  { id: "3JN", name: "3 John", testament: "NT", category: "General Epistles", chaptersCount: 1, theme: "Faithful hospitality and supporting workers for the truth" },
  { id: "JUD", name: "Jude", testament: "NT", category: "General Epistles", chaptersCount: 1, theme: "Contending earnestly for the faith once delivered to the saints" },
  { id: "REV", name: "Revelation", testament: "NT", category: "Prophecy", chaptersCount: 22, theme: "Jesus Christ the Alpha and Omega, King of kings, and eternal victory" },
];

// Offline Pre-Downloaded Core Chapters (KJV / WEB Public Domain)
export const PRELOADED_BIBLE_CHAPTERS: Record<string, BibleChapterData> = {
  // 📖 John 1 - Deity of Jesus Christ: God the Word Made Flesh
  "John-1": {
    book: "John",
    chapter: 1,
    translation: "King James Version (KJV)",
    verses: [
      { verse: 1, text: "In the beginning was the Word, and the Word was with God, and the Word was God." },
      { verse: 2, text: "The same was in the beginning with God." },
      { verse: 3, text: "All things were made by him; and without him was not any thing made that was made." },
      { verse: 4, text: "In him was life; and the life was the light of men." },
      { verse: 5, text: "And the light shineth in darkness; and the darkness comprehended it not." },
      { verse: 6, text: "There was a man sent from God, whose name was John." },
      { verse: 7, text: "The same came for a witness, to bear witness of the Light, that all men through him might believe." },
      { verse: 8, text: "He was not that Light, but was sent to bear witness of that Light." },
      { verse: 9, text: "That was the true Light, which lighteth every man that cometh into the world." },
      { verse: 10, text: "He was in the world, and the world was made by him, and the world knew him not." },
      { verse: 11, text: "He came unto his own, and his own received him not." },
      { verse: 12, text: "But as many as received him, to them gave he power to become the sons of God, even to them that believe on his name:" },
      { verse: 13, text: "Which were born, not of blood, nor of the will of the flesh, nor of the will of man, but of God." },
      { verse: 14, text: "And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth." },
      { verse: 15, text: "John bare witness of him, and cried, saying, This was he of whom I spake, He that cometh after me is preferred before me: for he was before me." },
      { verse: 16, text: "And of his fulness have all we received, and grace for grace." },
      { verse: 17, text: "For the law was given by Moses, but grace and truth came by Jesus Christ." },
      { verse: 18, text: "No man hath seen God at any time; the only begotten Son, which is in the bosom of the Father, he hath declared him." },
      { verse: 29, text: "The next day John seeth Jesus coming unto him, and saith, Behold the Lamb of God, which taketh away the sin of the world." },
      { verse: 34, text: "And I saw, and bare record that this is the Son of God." },
    ],
  },

  // 📖 John 3 - God So Loved the World & Salvation
  "John-3": {
    book: "John",
    chapter: 3,
    translation: "King James Version (KJV)",
    verses: [
      { verse: 1, text: "There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:" },
      { verse: 2, text: "The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God: for no man can do these miracles that thou doest, except God be with him." },
      { verse: 3, text: "Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God." },
      { verse: 5, text: "Jesus answered, Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of God." },
      { verse: 6, text: "That which is born of the flesh is flesh; and that which is born of the Spirit is spirit." },
      { verse: 7, text: "Marvel not that I said unto thee, Ye must be born again." },
      { verse: 14, text: "And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted up:" },
      { verse: 15, text: "That whosoever believeth in him should not perish, but have eternal life." },
      { verse: 16, text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
      { verse: 17, text: "For God sent not his Son into the world to condemn the world; but that the world through him might be saved." },
      { verse: 18, text: "He that believeth on him is not condemned: but he that believeth not is condemned already, because he hath not believed in the name of the only begotten Son of God." },
      { verse: 36, text: "He that believeth on the Son hath everlasting life: and he that believeth not the Son shall not see life; but the wrath of God abideth on him." },
    ],
  },

  // 📖 John 14 - Jesus the Only Way & Praying in His Name
  "John-14": {
    book: "John",
    chapter: 14,
    translation: "King James Version (KJV)",
    verses: [
      { verse: 1, text: "Let not your heart be troubled: ye believe in God, believe also in me." },
      { verse: 2, text: "In my Father's house are many mansions: if it were not so, I would have told you. I go to prepare a place for you." },
      { verse: 3, text: "And if I go and prepare a place for you, I will come again, and receive you unto myself; that where I am, there ye may be also." },
      { verse: 4, text: "And whither I go ye know, and the way ye know." },
      { verse: 5, text: "Thomas saith unto him, Lord, we know not whither thou goest; and how can we know the way?" },
      { verse: 6, text: "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me." },
      { verse: 7, text: "If ye had known me, ye should have known my Father also: and from henceforth ye know him, and have seen him." },
      { verse: 8, text: "Philip saith unto him, Lord, shew us the Father, and it sufficeth us." },
      { verse: 9, text: "Jesus saith unto him, Have I been so long time with you, and yet hast thou not known me, Philip? he that hath seen me hath seen the Father; and how sayest thou then, Shew us the Father?" },
      { verse: 10, text: "Believest thou not that I am in the Father, and the Father in me? the words that I speak unto you I speak not of myself: but the Father that dwelleth in me, he doeth the works." },
      { verse: 13, text: "And whatsoever ye shall ask in my name, that will I do, that the Father may be glorified in the Son." },
      { verse: 14, text: "If ye shall ask any thing in my name, I will do it." },
      { verse: 15, text: "If ye love me, keep my commandments." },
      { verse: 16, text: "And I will pray the Father, and he shall give you another Comforter, that he may abide with you for ever;" },
      { verse: 27, text: "Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid." },
    ],
  },

  // 📖 Romans 5 - Christ Died for Our Sins While We Were Sinners
  "Romans-5": {
    book: "Romans",
    chapter: 5,
    translation: "King James Version (KJV)",
    verses: [
      { verse: 1, text: "Therefore being justified by faith, we have peace with God through our Lord Jesus Christ:" },
      { verse: 2, text: "By whom also we have access by faith into this grace wherein we stand, and rejoice in hope of the glory of God." },
      { verse: 3, text: "And not only so, but we glory in tribulations also: knowing that tribulation worketh patience;" },
      { verse: 4, text: "And patience, experience; and experience, hope:" },
      { verse: 5, text: "And hope maketh not ashamed; because the love of God is shed abroad in our hearts by the Holy Ghost which is given unto us." },
      { verse: 6, text: "For when we were yet without strength, in due time Christ died for the ungodly." },
      { verse: 7, text: "For scarcely for a righteous man will one die: yet peradventure for a good man some would even dare to die." },
      { verse: 8, text: "But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us." },
      { verse: 9, text: "Much more then, being now justified by his blood, we shall be saved from wrath through him." },
      { verse: 10, text: "For if, when we were enemies, we were reconciled to God by the death of his Son, much more, being reconciled, we shall be saved by his life." },
      { verse: 11, text: "And not only so, but we also joy in God through our Lord Jesus Christ, by whom we have now received the atonement." },
    ],
  },

  // 📖 Romans 8 - No Condemnation in Christ Jesus
  "Romans-8": {
    book: "Romans",
    chapter: 8,
    translation: "King James Version (KJV)",
    verses: [
      { verse: 1, text: "There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit." },
      { verse: 2, text: "For the law of the Spirit of life in Christ Jesus hath made me free from the law of sin and death." },
      { verse: 14, text: "For as many as are led by the Spirit of God, they are the sons of God." },
      { verse: 15, text: "For ye have not received the spirit of bondage again to fear; but ye have received the Spirit of adoption, whereby we cry, Abba, Father." },
      { verse: 16, text: "The Spirit itself beareth witness with our spirit, that we are the children of God:" },
      { verse: 26, text: "Likewise the Spirit also helpeth our infirmities: for we know not what we should pray for as we ought: but the Spirit itself maketh intercession for us with groanings which cannot be uttered." },
      { verse: 28, text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose." },
      { verse: 31, text: "What shall we then say to these things? If God be for us, who can be against us?" },
      { verse: 32, text: "He that spared not his own Son, but delivered him up for us all, how shall he not with him also freely give us all things?" },
      { verse: 34, text: "Who is he that condemneth? It is Christ that died, yea rather, that is risen again, who is even at the right hand of God, who also maketh intercession for us." },
      { verse: 37, text: "Nay, in all these things we are more than conquerors through him that loved us." },
      { verse: 38, text: "For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come," },
      { verse: 39, text: "Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord." },
    ],
  },

  // 📖 Romans 10 - Faith in Christ & Calling on the Name of the Lord
  "Romans-10": {
    book: "Romans",
    chapter: 10,
    translation: "King James Version (KJV)",
    verses: [
      { verse: 8, text: "But what saith it? The word is nigh thee, even in thy mouth, and in thy heart: that is, the word of faith, which we preach;" },
      { verse: 9, text: "That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved." },
      { verse: 10, text: "For with the heart man believeth unto righteousness; and with the mouth confession is made unto salvation." },
      { verse: 11, text: "For the scripture saith, Whosoever believeth on him shall not be ashamed." },
      { verse: 12, text: "For there is no difference between the Jew and the Greek: for the same Lord over all is rich unto all that call upon him." },
      { verse: 13, text: "For whosoever shall call upon the name of the Lord shall be saved." },
      { verse: 17, text: "So then faith cometh by hearing, and hearing by the word of God." },
    ],
  },

  // 📖 Ephesians 2 - Saved by Grace Through Faith, Not of Works
  "Ephesians-2": {
    book: "Ephesians",
    chapter: 2,
    translation: "King James Version (KJV)",
    verses: [
      { verse: 1, text: "And you hath he quickened, who were dead in trespasses and sins;" },
      { verse: 4, text: "But God, who is rich in mercy, for his great love wherewith he loved us," },
      { verse: 5, text: "Even when we were dead in sins, hath quickened us together with Christ, (by grace ye are saved;)" },
      { verse: 6, text: "And hath raised us up together, and made us sit together in heavenly places in Christ Jesus:" },
      { verse: 7, text: "That in the ages to come he might shew the exceeding riches of his grace in his kindness toward us through Christ Jesus." },
      { verse: 8, text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God:" },
      { verse: 9, text: "Not of works, lest any man should boast." },
      { verse: 10, text: "For we are his workmanship, created in Christ Jesus unto good works, which God hath before ordained that we should walk in them." },
      { verse: 13, text: "But now in Christ Jesus ye who sometimes were far off are made nigh by the blood of Christ." },
      { verse: 18, text: "For through him we both have access by one Spirit unto the Father." },
    ],
  },

  // 📖 Philippians 2 - The Humility & Exaltation of Christ (God in the Flesh)
  "Philippians-2": {
    book: "Philippians",
    chapter: 2,
    translation: "King James Version (KJV)",
    verses: [
      { verse: 5, text: "Let this mind be in you, which was also in Christ Jesus:" },
      { verse: 6, text: "Who, being in the form of God, thought it not robbery to be equal with God:" },
      { verse: 7, text: "But made himself of no reputation, and took upon him the form of a servant, and was made in the likeness of men:" },
      { verse: 8, text: "And being found in fashion as a man, he humbled himself, and became obedient unto death, even the death of the cross." },
      { verse: 9, text: "Wherefore God also hath highly exalted him, and given him a name which is above every name:" },
      { verse: 10, text: "That at the name of Jesus every knee should bow, of things in heaven, and things in earth, and things under the earth;" },
      { verse: 11, text: "And that every tongue should confess that Jesus Christ is Lord, to the glory of God the Father." },
    ],
  },

  // 📖 Philippians 4 - Rejoice, Pray About Everything, Peace of God
  "Philippians-4": {
    book: "Philippians",
    chapter: 4,
    translation: "King James Version (KJV)",
    verses: [
      { verse: 4, text: "Rejoice in the Lord alway: and again I say, Rejoice." },
      { verse: 6, text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God." },
      { verse: 7, text: "And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus." },
      { verse: 8, text: "Finally, brethren, whatsoever things are true, whatsoever things are honest, whatsoever things are just, whatsoever things are pure, whatsoever things are lovely, whatsoever things are of good report; if there be any virtue, and if there be any praise, think on these things." },
      { verse: 11, text: "Not that I speak in respect of want: for I have learned, in whatsoever state I am, therewith to be content." },
      { verse: 13, text: "I can do all things through Christ which strengtheneth me." },
      { verse: 19, text: "But my God shall supply all your need according to his riches in glory by Christ Jesus." },
    ],
  },

  // 📖 Colossians 1 - The Deity and Supremacy of Christ
  "Colossians-1": {
    book: "Colossians",
    chapter: 1,
    translation: "King James Version (KJV)",
    verses: [
      { verse: 13, text: "Who hath delivered us from the power of darkness, and hath translated us into the kingdom of his dear Son:" },
      { verse: 14, text: "In whom we have redemption through his blood, even the forgiveness of sins:" },
      { verse: 15, text: "Who is the image of the invisible God, the firstborn of every creature:" },
      { verse: 16, text: "For by him were all things created, that are in heaven, and that are in earth, visible and invisible, whether they be thrones, or dominions, or principalities, or powers: all things were created by him, and for him:" },
      { verse: 17, text: "And he is before all things, and by him all things consist." },
      { verse: 18, text: "And he is the head of the body, the church: who is the beginning, the firstborn from the dead; that in all things he might have the preeminence." },
      { verse: 19, text: "For it pleased the Father that in him should all fulness dwell;" },
      { verse: 20, text: "And, having made peace through the blood of his cross, by him to reconcile all things unto himself." },
    ],
  },

  // 📖 Colossians 2 - Fullness of the Godhead Bodily in Christ
  "Colossians-2": {
    book: "Colossians",
    chapter: 2,
    translation: "King James Version (KJV)",
    verses: [
      { verse: 6, text: "As ye have therefore received Christ Jesus the Lord, so walk ye in him:" },
      { verse: 7, text: "Rooted and built up in him, and stablished in the faith, as ye have been taught, abounding therein with thanksgiving." },
      { verse: 8, text: "Beware lest any man spoil you through philosophy and vain deceit, after the tradition of men, after the rudiments of the world, and not after Christ." },
      { verse: 9, text: "For in him dwelleth all the fulness of the Godhead bodily." },
      { verse: 10, text: "And ye are complete in him, which is the head of all principality and power:" },
      { verse: 13, text: "And you, being dead in your sins and the uncircumcision of your flesh, hath he quickened together with him, having forgiven you all trespasses;" },
      { verse: 14, text: "Blotting out the handwriting of ordinances that was against us, which was contrary to us, and took it out of the way, nailing it to his cross." },
    ],
  },

  // 📖 Hebrews 4 - Jesus Our Great High Priest & Throne of Grace
  "Hebrews-4": {
    book: "Hebrews",
    chapter: 4,
    translation: "King James Version (KJV)",
    verses: [
      { verse: 12, text: "For the word of God is quick, and powerful, and sharper than any twoedged sword, piercing even to the dividing asunder of soul and spirit, and of the joints and marrow, and is a discerner of the thoughts and intents of the heart." },
      { verse: 14, text: "Seeing then that we have a great high priest, that is passed into the heavens, Jesus the Son of God, let us hold fast our profession." },
      { verse: 15, text: "For we have not an high priest which cannot be touched with the feeling of our infirmities; but was in all points tempted like as we are, yet without sin." },
      { verse: 16, text: "Let us therefore come boldly unto the throne of grace, that we may obtain mercy, and find grace to help in time of need." },
    ],
  },

  // 📖 1 John 1 - Fellowship with God and Cleansing Through Christ
  "1 John-1": {
    book: "1 John",
    chapter: 1,
    translation: "King James Version (KJV)",
    verses: [
      { verse: 1, text: "That which was from the beginning, which we have heard, which we have seen with our eyes, which we have looked upon, and our hands have handled, of the Word of life;" },
      { verse: 5, text: "This then is the message which we have heard of him, and declare unto you, that God is light, and in him is no darkness at all." },
      { verse: 7, text: "But if we walk in the light, as he is in the light, we have fellowship one with another, and the blood of Jesus Christ his Son cleanseth us from all sin." },
      { verse: 8, text: "If we say that we have no sin, we deceive ourselves, and the truth is not in us." },
      { verse: 9, text: "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness." },
    ],
  },

  // 📖 Psalm 23 - The Lord is My Shepherd
  "Psalms-23": {
    book: "Psalms",
    chapter: 23,
    translation: "King James Version (KJV)",
    verses: [
      { verse: 1, text: "The LORD is my shepherd; I shall not want." },
      { verse: 2, text: "He maketh me to lie down in green pastures: he leadeth me beside the still waters." },
      { verse: 3, text: "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake." },
      { verse: 4, text: "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me." },
      { verse: 5, text: "Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over." },
      { verse: 6, text: "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever." },
    ],
  },

  // 📖 Psalm 46 - God is Our Refuge & Be Still
  "Psalms-46": {
    book: "Psalms",
    chapter: 46,
    translation: "King James Version (KJV)",
    verses: [
      { verse: 1, text: "God is our refuge and strength, a very present help in trouble." },
      { verse: 2, text: "Therefore will not we fear, though the earth be removed, and though the mountains be carried into the midst of the sea;" },
      { verse: 7, text: "The LORD of hosts is with us; the God of Jacob is our refuge. Selah." },
      { verse: 10, text: "Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth." },
      { verse: 11, text: "The LORD of hosts is with us; the God of Jacob is our refuge. Selah." },
    ],
  },

  // 📖 Psalm 91 - Abiding Under the Shadow of the Almighty
  "Psalms-91": {
    book: "Psalms",
    chapter: 91,
    translation: "King James Version (KJV)",
    verses: [
      { verse: 1, text: "He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty." },
      { verse: 2, text: "I will say of the LORD, He is my refuge and my fortress: my God; in him will I trust." },
      { verse: 3, text: "Surely he shall deliver thee from the snare of the fowler, and from the noisome pestilence." },
      { verse: 4, text: "He shall cover thee with his feathers, and under his wings shalt thou trust: his truth shall be thy shield and buckler." },
      { verse: 5, text: "Thou shalt not be afraid for the terror by night; nor for the arrow that flieth by day;" },
      { verse: 11, text: "For he shall give his angels charge over thee, to keep thee in all thy ways." },
      { verse: 14, text: "Because he hath set his love upon me, therefore will I deliver him: I will set him on high, because he hath known my name." },
      { verse: 15, text: "He shall call upon me, and I will answer him: I will be with him in trouble; I will deliver him, and honour him." },
      { verse: 16, text: "With long life will I satisfy him, and shew him my salvation." },
    ],
  },

  // 📖 Proverbs 3 - Trust in the Lord with All Thine Heart
  "Proverbs-3": {
    book: "Proverbs",
    chapter: 3,
    translation: "King James Version (KJV)",
    verses: [
      { verse: 1, text: "My son, forget not my law; but let thine heart keep my commandments:" },
      { verse: 2, text: "For length of days, and long life, and peace, shall they add to thee." },
      { verse: 3, text: "Let not mercy and truth forsake thee: bind them about thy neck; write them upon the table of thine heart:" },
      { verse: 4, text: "So shalt thou find favour and good understanding in the sight of God and man." },
      { verse: 5, text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding." },
      { verse: 6, text: "In all thy ways acknowledge him, and he shall direct thy paths." },
      { verse: 7, text: "Be not wise in thine own eyes: fear the LORD, and depart from evil." },
      { verse: 8, text: "It shall be health to thy navel, and marrow to thy bones." },
      { verse: 13, text: "Happy is the man that findeth wisdom, and the man that getteth understanding." },
    ],
  },

  // 📖 Isaiah 53 - The Suffering Servant: Wounded for Our Transgressions
  "Isaiah-53": {
    book: "Isaiah",
    chapter: 53,
    translation: "King James Version (KJV)",
    verses: [
      { verse: 1, text: "Who hath believed our report? and to whom is the arm of the LORD revealed?" },
      { verse: 3, text: "He is despised and rejected of men; a man of sorrows, and acquainted with grief: and we hid as it were our faces from him; he was despised, and we esteemed him not." },
      { verse: 4, text: "Surely he hath borne our griefs, and carried our sorrows: yet we did esteem him stricken, smitten of God, and afflicted." },
      { verse: 5, text: "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed." },
      { verse: 6, text: "All we like sheep have gone astray; we have turned every one to his own way; and the LORD hath laid on him the iniquity of us all." },
      { verse: 7, text: "He was oppressed, and he was afflicted, yet he opened not his mouth: he is brought as a lamb to the slaughter, and as a sheep before her shearers is dumb, so he openeth not his mouth." },
      { verse: 10, text: "Yet it pleased the LORD to bruise him; he hath put him to grief: when thou shalt make his soul an offering for sin, he shall see his seed, he shall prolong his days, and the pleasure of the LORD shall prosper in his hand." },
      { verse: 11, text: "He shall see of the travail of his soul, and shall be satisfied: by his knowledge shall my righteous servant justify many; for he shall bear their iniquities." },
      { verse: 12, text: "Therefore will I divide him a portion with the great, and he shall divide the spoil with the strong; because he hath poured out his soul unto death: and he was numbered with the transgressors; and he bare the sin of many, and made intercession for the transgressors." },
    ],
  },

  // 📖 Matthew 6 - Praying Directly to God & The Model Prayer
  "Matthew-6": {
    book: "Matthew",
    chapter: 6,
    translation: "King James Version (KJV)",
    verses: [
      { verse: 5, text: "And when thou prayest, thou shalt not be as the hypocrites are: for they love to pray standing in the synagogues and in the corners of the streets, that they may be seen of men." },
      { verse: 6, text: "But thou, when thou prayest, enter into thy closet, and when thou hast shut thy door, pray to thy Father which is in secret; and thy Father which seeth in secret shall reward thee openly." },
      { verse: 7, text: "But when ye pray, use not vain repetitions, as the heathen do: for they think that they shall be heard for their much speaking." },
      { verse: 8, text: "Be not ye therefore like unto them: for your Father knoweth what things ye have need of, before ye ask him." },
      { verse: 9, text: "After this manner therefore pray ye: Our Father which art in heaven, Hallowed be thy name." },
      { verse: 10, text: "Thy kingdom come. Thy will be done in earth, as it is in heaven." },
      { verse: 11, text: "Give us this day our daily bread." },
      { verse: 12, text: "And forgive us our debts, as we forgive our debtors." },
      { verse: 13, text: "And lead us not into temptation, but deliver us from evil: For thine is the kingdom, and the power, and the glory, for ever. Amen." },
      { verse: 31, text: "Therefore take no thought, saying, What shall we eat? or, What shall we drink? or, Wherewithal shall we be clothed?" },
      { verse: 32, text: "(For after all these things do the Gentiles seek:) for your heavenly Father knoweth that ye have need of all these things." },
      { verse: 33, text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you." },
      { verse: 34, text: "Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself. Sufficient unto the day is the evil thereof." },
    ],
  },
};

// ✝️ Biblical Foundations: Topical Scriptures & Promises
export interface TopicalScripture {
  id: string;
  topic:
    | "Deity of Jesus Christ"
    | "Christ Died for Our Sins"
    | "Praying Directly to God Alone"
    | "Salvation by Grace Alone"
    | "Peace, Trust & Anxiety"
    | "Strength in Trials";
  reference: string;
  text: string;
  explanation: string;
}

export const TOPICAL_SCRIPTURES: TopicalScripture[] = [
  // 1. Deity of Jesus Christ (God Come in the Flesh)
  {
    id: "deity-1",
    topic: "Deity of Jesus Christ",
    reference: "John 1:1, 14",
    text: "In the beginning was the Word, and the Word was with God, and the Word was God... And the Word was made flesh, and dwelt among us.",
    explanation: "Jesus Christ is eternal God who took upon human flesh to dwell with us and redeem us.",
  },
  {
    id: "deity-2",
    topic: "Deity of Jesus Christ",
    reference: "Colossians 2:9",
    text: "For in him dwelleth all the fulness of the Godhead bodily.",
    explanation: "All the fullness of God's divine nature lives in Jesus Christ in bodily form.",
  },
  {
    id: "deity-3",
    topic: "Deity of Jesus Christ",
    reference: "1 Timothy 3:16",
    text: "And without controversy great is the mystery of godliness: God was manifest in the flesh, justified in the Spirit, seen of angels, preached unto the Gentiles, believed on in the world, received up into glory.",
    explanation: "God Himself was manifested in the flesh in the person of Jesus Christ.",
  },
  {
    id: "deity-4",
    topic: "Deity of Jesus Christ",
    reference: "Titus 2:13",
    text: "Looking for that blessed hope, and the glorious appearing of the great God and our Saviour Jesus Christ.",
    explanation: "Scripture explicitly calls Jesus Christ our great God and Savior.",
  },
  {
    id: "deity-5",
    topic: "Deity of Jesus Christ",
    reference: "Hebrews 1:8",
    text: "But unto the Son he saith, Thy throne, O God, is for ever and ever: a sceptre of righteousness is the sceptre of thy kingdom.",
    explanation: "The Father addresses the Son Jesus Christ directly as God.",
  },

  // 2. Christ Died for Our Sins (The Atonement & The Cross)
  {
    id: "atonement-1",
    topic: "Christ Died for Our Sins",
    reference: "Romans 5:8",
    text: "But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us.",
    explanation: "Christ paid the complete penalty for our sins out of infinite love on the cross.",
  },
  {
    id: "atonement-2",
    topic: "Christ Died for Our Sins",
    reference: "1 Corinthians 15:3-4",
    text: "For I delivered unto you first of all that which I also received, how that Christ died for our sins according to the scriptures; And that he was buried, and that he rose again the third day according to the scriptures.",
    explanation: "The core gospel message: Christ died for our sins, was buried, and physically rose on the third day.",
  },
  {
    id: "atonement-3",
    topic: "Christ Died for Our Sins",
    reference: "2 Corinthians 5:21",
    text: "For he hath made him to be sin for us, who knew no sin; that we might be made the righteousness of God in him.",
    explanation: "The Great Exchange: Jesus bore our sin so we receive His perfect righteousness.",
  },
  {
    id: "atonement-4",
    topic: "Christ Died for Our Sins",
    reference: "1 Peter 2:24",
    text: "Who his own self bare our sins in his own body on the tree, that we, being dead to sins, should live unto righteousness: by whose stripes ye were healed.",
    explanation: "Jesus carried our sins in His own body on the cross, purchasing our spiritual healing.",
  },

  // 3. Praying Directly to God Alone (No Intermediaries / No Saints or Mary)
  {
    id: "prayer-1",
    topic: "Praying Directly to God Alone",
    reference: "1 Timothy 2:5",
    text: "For there is one God, and one mediator between God and men, the man Christ Jesus;",
    explanation: "Scripture teaches there is ONLY ONE mediator between God and humanity: Jesus Christ alone. We do not pray to saints, Mary, or angels.",
  },
  {
    id: "prayer-2",
    topic: "Praying Directly to God Alone",
    reference: "Hebrews 4:16",
    text: "Let us therefore come boldly unto the throne of grace, that we may obtain mercy, and find grace to help in time of need.",
    explanation: "Because of Jesus, every believer has direct, bold access straight to God's throne of grace in prayer.",
  },
  {
    id: "prayer-3",
    topic: "Praying Directly to God Alone",
    reference: "Matthew 6:6, 9",
    text: "When thou prayest, enter into thy closet... pray to thy Father which is in secret... After this manner therefore pray ye: Our Father which art in heaven, Hallowed be thy name.",
    explanation: "Jesus instructed us to pray directly to our Heavenly Father in secret and in truth.",
  },
  {
    id: "prayer-4",
    topic: "Praying Directly to God Alone",
    reference: "John 14:13-14",
    text: "And whatsoever ye shall ask in my name, that will I do, that the Father may be glorified in the Son. If ye shall ask any thing in my name, I will do it.",
    explanation: "We pray to the Father in the precious name of Jesus Christ alone.",
  },

  // 4. Salvation by Grace Alone Through Faith in Christ Alone
  {
    id: "salvation-1",
    topic: "Salvation by Grace Alone",
    reference: "Ephesians 2:8-9",
    text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.",
    explanation: "Salvation is a free gift received by faith in Jesus Christ, not earned through human works or rituals.",
  },
  {
    id: "salvation-2",
    topic: "Salvation by Grace Alone",
    reference: "Romans 10:9-10",
    text: "That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved. For with the heart man believeth unto righteousness; and with the mouth confession is made unto salvation.",
    explanation: "Saving faith is trusting in Jesus Christ as Lord and believing God raised Him from the dead.",
  },
  {
    id: "salvation-3",
    topic: "Salvation by Grace Alone",
    reference: "Acts 4:12",
    text: "Neither is there salvation in any other: for there is none other name under heaven given among men, whereby we must be saved.",
    explanation: "Salvation is found exclusively in the name of Jesus Christ alone.",
  },

  // 5. Peace, Trust & Anxiety
  {
    id: "peace-1",
    topic: "Peace, Trust & Anxiety",
    reference: "Philippians 4:6-7",
    text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.",
    explanation: "Surrendering our worries to God in prayer produces supernatural peace guarding heart and mind.",
  },
  {
    id: "peace-2",
    topic: "Peace, Trust & Anxiety",
    reference: "1 Peter 5:7",
    text: "Casting all your care upon him; for he careth for you.",
    explanation: "The Lord tenderly invites us to cast every burden upon Him because He cares for us.",
  },
  {
    id: "peace-3",
    topic: "Peace, Trust & Anxiety",
    reference: "Isaiah 26:3",
    text: "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.",
    explanation: "Fixing our focus upon the Lord keeps our soul anchored in perfect peace.",
  },

  // 6. Strength in Trials
  {
    id: "strength-1",
    topic: "Strength in Trials",
    reference: "Isaiah 40:29, 31",
    text: "He giveth power to the faint; and to them that have no might he increaseth strength... But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.",
    explanation: "Waiting upon the Lord renews divine strength for every season of exhaustion.",
  },
  {
    id: "strength-2",
    topic: "Strength in Trials",
    reference: "2 Corinthians 12:9",
    text: "And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness. Most gladly therefore will I rather glory in my infirmities, that the power of Christ may rest upon me.",
    explanation: "In our human limitations, Christ's supernatural power and all-sufficient grace are displayed.",
  },
];

// Helper to fetch any chapter from public domain Bible API with local caching
export async function getBibleChapter(bookName: string, chapterNumber: number): Promise<BibleChapterData> {
  const cacheKey = `bible_offline_chapter_${bookName}_${chapterNumber}`;
  
  // 1. Check in preloaded embedded static dataset
  const preloadedKey = `${bookName}-${chapterNumber}`;
  if (PRELOADED_BIBLE_CHAPTERS[preloadedKey]) {
    return PRELOADED_BIBLE_CHAPTERS[preloadedKey];
  }

  // 2. Check localStorage cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.verses) && parsed.verses.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Error reading cached chapter:", e);
  }

  // 3. Fetch from public domain KJV bible API
  try {
    const query = encodeURIComponent(`${bookName} ${chapterNumber}`);
    const res = await fetch(`https://bible-api.com/${query}?translation=kjv`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    if (data && Array.isArray(data.verses) && data.verses.length > 0) {
      const chapterData: BibleChapterData = {
        book: bookName,
        chapter: chapterNumber,
        translation: "King James Version (KJV)",
        verses: data.verses.map((v: any) => ({
          verse: v.verse,
          text: (v.text || "").trim(),
        })),
      };

      // Save to localStorage for permanent offline access
      try {
        localStorage.setItem(cacheKey, JSON.stringify(chapterData));
      } catch (e) {
        console.warn("Could not cache chapter to localStorage:", e);
      }

      return chapterData;
    }
  } catch (err) {
    console.warn(`Could not fetch ${bookName} ${chapterNumber} from API:`, err);
  }

  // 4. Fallback if not available online: return synthesized chapter stub with guidance
  return {
    book: bookName,
    chapter: chapterNumber,
    translation: "King James Version (KJV)",
    verses: [
      {
        verse: 1,
        text: `Reading ${bookName} Chapter ${chapterNumber}. Connect to the internet to cache this full chapter offline, or browse the pre-downloaded core books (John, Romans, Ephesians, Philippians, Colossians, Psalms, Proverbs, Isaiah, Matthew, etc.)!`,
      },
    ],
  };
}
