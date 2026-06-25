(function () {
    "use strict";

    var MODEL_BASE = "https://arman-bd.github.io/guppylm";
    var MODEL_CONFIG = {
        vocabSize: 4096,
        maxSequenceLength: 128,
        eosId: 2
    };
    var GENERATION_CONFIG = {
        temperature: 0.7,
        topK: 50,
        maxTokens: 32
    };

    var modelSession = null;
    var tokenizer = null;
    var modelLoadingPromise = null;
    var scriptUrl = document.currentScript && document.currentScript.src
        ? document.currentScript.src
        : new URL("assets/js/chat-assistant.js", window.location.origin + "/").href;

    var knowledgeBase = {
        introduction: "Dr. Yutian Tang is a researcher in AI Coding Agents and Trustworthy LLMs at the School of Computing Science, University of Glasgow, where he is a PI and PhD supervisor. His group studies secure, reliable, and accountable AI-driven software engineering systems.",
        research: "Yutian's current research focuses on:\n• Agentic AI and LLM-driven software engineering\n• AI security, alignment, copyright, and watermarking\n• Trustworthy LLMs and benchmark-driven evaluation\n• Software and mobile ecosystem security\n• Program analysis, testing, and automated repair",
        publications: "Yutian has published 50+ papers at venues including ICSE, FSE, OOPSLA, CCS, The Web Conference, ASE, ISSTA, IEEE TSE, and ACM TOSEM. The Publications page has the full and current list.",
        awards: "Selected honors include:\n• ACM SIGSOFT Distinguished Paper Award at ICSE 2026\n• Best Industry Paper Award at ISSRE 2018\n• IEEE Senior Member\n• OpenAI Cybersecurity Grant and OpenAI API Researcher Access support\n• Google Cloud for Researchers award",
        positions: "Yutian selectively considers fully funded or self-funded PhD applicants, remote research assistants, and interns when there is a strong fit with his group's agenda. Applicants should read the Join us/Supervision page and send the requested materials, including a CV and a clear research proposal tied to recent work from the group.",
        contact: "Email: Yutian.Tang [at] glasgow.ac.uk\nUniversity profile: https://www.gla.ac.uk/schools/computing/staff/yutiantang\nPersonal homepage: https://www.chrisyttang.org/",
        education: "Yutian received his PhD in Computer Science from the Hong Kong Polytechnic University, supervised by Prof. Xiapu Luo and Dr. Hareton Leung. He visited Lund University in 2025, hosted by Prof. Per Runeson.",
        service: "Yutian has served more than 50 times on program committees, including ICSE, FSE, ASE, The Web Conference, ICPC, SANER, EASE, MSR, APSEC, and MobileSoft. He has also served in organizing roles for EASE, APSEC, and Internetware and as an editorial board member.",
        funding: "His research has received support from the National Natural Science Foundation of China, the Science and Technology Commission of Shanghai Municipality, Lund University, OpenAI, and Google.",
        latest: "Recent homepage highlights include an ACM SIGSOFT Distinguished Paper Award at ICSE 2026, an OOPSLA 2026 paper on LLM-based test suite augmentation, and new service roles for ICSE 2027, FSE 2027, ASE 2026, and APSEC 2026.",
        papers: "Notable recent topics include LLM-assisted Android configuration repair, LLM-assisted inter-procedural security analysis, automated test-suite augmentation, binary code similarity, smart-contract analysis, mobile privacy, and empirical evaluation of AI coding systems."
    };

    function answerFromKnowledgeBase(input) {
        var query = input.toLowerCase();

        if (/phd|student|supervis|position|opening|apply|intern|assistant|join|招生|博士|实习/.test(query)) {
            return knowledgeBase.positions;
        }
        if (/award|honou?r|prize|distinguished|issre|sigsoft|奖/.test(query)) {
            return knowledgeBase.awards;
        }
        if (/publication|paper|venue|icse|fse|oopsla|tse|tosem|论文|发表/.test(query)) {
            return knowledgeBase.publications + "\n\n" + knowledgeBase.papers;
        }
        if (/research|interest|topic|focus|work on|方向|研究/.test(query)) {
            return knowledgeBase.research;
        }
        if (/contact|email|mail|reach|联系|邮箱/.test(query)) {
            return knowledgeBase.contact;
        }
        if (/education|degree|phd.*where|polytechnic|lund|学历|毕业/.test(query)) {
            return knowledgeBase.education;
        }
        if (/service|committee|chair|review|editor|pc\b|学术服务/.test(query)) {
            return knowledgeBase.service;
        }
        if (/fund|grant|support|openai|google|资助|基金/.test(query)) {
            return knowledgeBase.funding;
        }
        if (/latest|recent|news|2026|最新|新闻/.test(query)) {
            return knowledgeBase.latest;
        }
        if (/who|introduce|about|yutian|tang|你是谁|介绍/.test(query)) {
            return knowledgeBase.introduction + "\n\n" + knowledgeBase.research;
        }
        if (/^(hi|hello|hey|你好|嗨)[!,. ]*$/.test(query)) {
            return "Hello! I'm guppyLM-9M, Yutian's tiny fish assistant. Ask me about his research, papers, awards, academic service, or open positions.";
        }

        return null;
    }

    function createTokenizer(json) {
        var vocab = json.model.vocab;
        var merges = json.model.merges;
        var addedTokens = {};
        var idToToken = {};
        var byteToChar = {};
        var charToByte = {};
        var directBytes = new Set();
        var mergeRank = {};
        var nextExtraCodePoint = 0;
        var pattern = /'(?:[sdmt]|ll|ve|re)| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;

        json.added_tokens.forEach(function (token) {
            addedTokens[token.content] = token.id;
        });
        Object.keys(vocab).forEach(function (token) {
            idToToken[vocab[token]] = token;
        });
        Object.keys(addedTokens).forEach(function (token) {
            idToToken[addedTokens[token]] = token;
        });

        [[33, 126], [161, 172], [174, 255]].forEach(function (range) {
            for (var value = range[0]; value <= range[1]; value += 1) {
                directBytes.add(value);
            }
        });
        for (var byte = 0; byte < 256; byte += 1) {
            byteToChar[byte] = directBytes.has(byte)
                ? String.fromCharCode(byte)
                : String.fromCharCode(256 + nextExtraCodePoint++);
        }
        Object.keys(byteToChar).forEach(function (key) {
            charToByte[byteToChar[key]] = Number(key);
        });
        merges.forEach(function (merge, index) {
            mergeRank[Array.isArray(merge) ? merge.join(" ") : merge] = index;
        });

        function bytesToTokenString(bytes) {
            return Array.from(bytes).map(function (value) {
                return byteToChar[value];
            }).join("");
        }

        function tokenStringToBytes(value) {
            return Uint8Array.from(Array.from(value).map(function (character) {
                return charToByte[character] === undefined
                    ? character.charCodeAt(0)
                    : charToByte[character];
            }));
        }

        function applyBpe(word) {
            var pieces = word.slice();
            if (pieces.length <= 1) {
                return pieces;
            }

            while (pieces.length > 1) {
                var bestRank = Infinity;
                var bestIndex = -1;
                for (var index = 0; index < pieces.length - 1; index += 1) {
                    var rank = mergeRank[pieces[index] + " " + pieces[index + 1]];
                    if (rank !== undefined && rank < bestRank) {
                        bestRank = rank;
                        bestIndex = index;
                    }
                }
                if (bestIndex === -1) {
                    break;
                }
                pieces = pieces.slice(0, bestIndex)
                    .concat([pieces[bestIndex] + pieces[bestIndex + 1]])
                    .concat(pieces.slice(bestIndex + 2));
            }
            return pieces;
        }

        function encode(text) {
            var specialPattern = Object.keys(addedTokens).map(function (token) {
                return token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            }).join("|");
            var segments = specialPattern
                ? text.split(new RegExp("(" + specialPattern + ")"))
                : [text];
            var ids = [];

            segments.forEach(function (segment) {
                if (!segment) {
                    return;
                }
                if (addedTokens[segment] !== undefined) {
                    ids.push(addedTokens[segment]);
                    return;
                }
                (segment.match(pattern) || [segment]).forEach(function (word) {
                    var bytes = new TextEncoder().encode(word);
                    var characters = Array.from(bytesToTokenString(bytes));
                    applyBpe(characters).forEach(function (token) {
                        if (vocab[token] !== undefined) {
                            ids.push(vocab[token]);
                        }
                    });
                });
            });
            return ids;
        }

        function decode(ids) {
            var value = ids.map(function (id) {
                var token = idToToken[id];
                return token && addedTokens[token] === undefined ? token : "";
            }).join("");
            return new TextDecoder("utf-8", { fatal: false }).decode(tokenStringToBytes(value));
        }

        return { encode: encode, decode: decode };
    }

    async function loadModel() {
        if (modelSession) {
            return true;
        }
        if (modelLoadingPromise) {
            return modelLoadingPromise;
        }

        modelLoadingPromise = (async function () {
            try {
                var ort = await import("https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/ort.min.mjs");
                ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/";
                window.ytChatOrt = ort;

                var responses = await Promise.all([
                    fetch(MODEL_BASE + "/tokenizer.json"),
                    fetch(MODEL_BASE + "/model.onnx")
                ]);
                if (!responses[0].ok || !responses[1].ok) {
                    throw new Error("The model files could not be downloaded.");
                }

                tokenizer = createTokenizer(await responses[0].json());
                modelSession = await ort.InferenceSession.create(
                    await responses[1].arrayBuffer(),
                    { executionProviders: ["wasm"] }
                );
                return true;
            } catch (error) {
                console.error("guppyLM-9M failed to load:", error);
                modelLoadingPromise = null;
                return false;
            }
        }());

        return modelLoadingPromise;
    }

    async function generateReply(text) {
        var ort = window.ytChatOrt;
        var prompt = "<|im_start|>user\n" + text + "<|im_end|>\n<|im_start|>assistant\n";
        var inputIds = tokenizer.encode(prompt);
        var ids = inputIds.slice();

        for (var step = 0; step < GENERATION_CONFIG.maxTokens; step += 1) {
            var sequence = ids.slice(-MODEL_CONFIG.maxSequenceLength);
            var tensor = new ort.Tensor(
                "int64",
                BigInt64Array.from(sequence.map(BigInt)),
                [1, sequence.length]
            );
            var output = await modelSession.run({ input_ids: tensor });
            var logits = output.logits.data;
            var offset = (sequence.length - 1) * MODEL_CONFIG.vocabSize;
            var values = new Float32Array(MODEL_CONFIG.vocabSize);
            var ranked;
            var cutoff;
            var maxValue = -Infinity;
            var probabilitySum = 0;
            var probabilities = new Float32Array(MODEL_CONFIG.vocabSize);

            for (var vocabularyIndex = 0; vocabularyIndex < MODEL_CONFIG.vocabSize; vocabularyIndex += 1) {
                values[vocabularyIndex] = logits[offset + vocabularyIndex] / GENERATION_CONFIG.temperature;
            }
            ranked = Array.from(values).sort(function (left, right) {
                return right - left;
            });
            cutoff = ranked[Math.min(GENERATION_CONFIG.topK, ranked.length) - 1];

            for (var topIndex = 0; topIndex < MODEL_CONFIG.vocabSize; topIndex += 1) {
                if (values[topIndex] < cutoff) {
                    values[topIndex] = -Infinity;
                } else if (values[topIndex] > maxValue) {
                    maxValue = values[topIndex];
                }
            }
            for (var probabilityIndex = 0; probabilityIndex < MODEL_CONFIG.vocabSize; probabilityIndex += 1) {
                probabilities[probabilityIndex] = values[probabilityIndex] === -Infinity
                    ? 0
                    : Math.exp(values[probabilityIndex] - maxValue);
                probabilitySum += probabilities[probabilityIndex];
            }

            var randomValue = Math.random();
            var accumulated = 0;
            var nextId = 0;
            for (var sampleIndex = 0; sampleIndex < MODEL_CONFIG.vocabSize; sampleIndex += 1) {
                accumulated += probabilities[sampleIndex] / probabilitySum;
                if (accumulated >= randomValue) {
                    nextId = sampleIndex;
                    break;
                }
            }

            ids.push(nextId);
            if (nextId === MODEL_CONFIG.eosId) {
                break;
            }
        }

        return tokenizer.decode(ids.slice(inputIds.length))
            .split("<|im_end|>")[0]
            .split("<|im_start|>")[0]
            .trim();
    }

    function addMessage(body, text, type) {
        var message = document.createElement("div");
        message.className = "yt-chat-message yt-chat-message--" + type;
        message.textContent = text;
        body.appendChild(message);
        body.scrollTop = body.scrollHeight;
        return message;
    }

    function createWidget() {
        var stylesheet = document.createElement("link");
        var assetRoot = new URL("../", scriptUrl);
        stylesheet.rel = "stylesheet";
        stylesheet.href = new URL("css/chat-assistant.css", assetRoot).href;
        document.head.appendChild(stylesheet);

        var launcher = document.createElement("button");
        launcher.className = "yt-chat-launcher";
        launcher.type = "button";
        launcher.setAttribute("aria-label", "Chat with Yutian's fish assistant");
        launcher.setAttribute("aria-expanded", "false");
        launcher.innerHTML = [
            '<span class="yt-chat-tooltip">Chat with Yutian\'s Fish</span>',
            '<svg viewBox="0 0 120 80" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">',
            '<ellipse cx="58" cy="40" rx="34" ry="22" fill="#003865"/>',
            '<ellipse cx="58" cy="46" rx="24" ry="12" fill="#2f80b7" opacity=".55"/>',
            '<path d="M24 40Q8 24 14 12q6 10 10 18Z" fill="#5ba1cf"/>',
            '<path d="M24 40Q8 56 14 68q6-10 10-18Z" fill="#5ba1cf"/>',
            '<path d="M50 18Q58 4 70 16q-8 2-16 2Z" fill="#7ab5d9"/>',
            '<circle cx="76" cy="36" r="5" fill="#fff"/>',
            '<circle cx="77.5" cy="35.5" r="2.5" fill="#17252f"/>',
            '<circle cx="78.5" cy="34.5" r="1" fill="#fff"/>',
            '<path d="M90 40q2 2 0 4" fill="none" stroke="#d8ebf7" stroke-linecap="round"/>',
            '<text x="47" y="43" fill="#fff" font-family="Arial,sans-serif" font-size="8" font-weight="700">LLM</text>',
            '<circle cx="99" cy="25" r="2" fill="none" stroke="#5ba1cf"><animate attributeName="cy" values="28;18;10" dur="2.2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;.4;0" dur="2.2s" repeatCount="indefinite"/></circle>',
            "</svg>"
        ].join("");

        var panel = document.createElement("section");
        panel.className = "yt-chat-panel";
        panel.setAttribute("aria-label", "Yutian's fish assistant");
        panel.innerHTML = [
            '<div class="yt-chat-header">',
            "<span>🐟 guppyLM-9M</span>",
            '<button class="yt-chat-close" type="button" aria-label="Close chat">&times;</button>',
            "</div>",
            '<div class="yt-chat-body" aria-live="polite"></div>',
            '<form class="yt-chat-input-row">',
            '<input class="yt-chat-input" type="text" maxlength="500" autocomplete="off" aria-label="Message" placeholder="Ask about Yutian\'s research...">',
            '<button class="yt-chat-send" type="submit">Send</button>',
            "</form>"
        ].join("");

        document.body.appendChild(panel);
        document.body.appendChild(launcher);

        var body = panel.querySelector(".yt-chat-body");
        var input = panel.querySelector(".yt-chat-input");
        var sendButton = panel.querySelector(".yt-chat-send");
        var closeButton = panel.querySelector(".yt-chat-close");
        var form = panel.querySelector("form");

        var welcome = document.createElement("div");
        welcome.className = "yt-chat-message yt-chat-message--bot";
        welcome.appendChild(document.createTextNode("Hi! I'm "));
        var modelLink = document.createElement("a");
        modelLink.href = "https://huggingface.co/arman-bd/guppylm-9M";
        modelLink.target = "_blank";
        modelLink.rel = "noopener noreferrer";
        modelLink.textContent = "guppyLM-9M";
        welcome.appendChild(modelLink);
        welcome.appendChild(document.createTextNode("-fish raised by Yutian. Ask about Yutian's research, papers, awards, academic service, or open positions!"));
        body.appendChild(welcome);

        function togglePanel(forceOpen) {
            var shouldOpen = forceOpen === undefined
                ? !panel.classList.contains("is-open")
                : forceOpen;
            panel.classList.toggle("is-open", shouldOpen);
            launcher.setAttribute("aria-expanded", String(shouldOpen));
            if (shouldOpen) {
                input.focus();
            }
        }

        launcher.addEventListener("click", function () {
            togglePanel();
        });
        closeButton.addEventListener("click", function () {
            togglePanel(false);
        });
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && panel.classList.contains("is-open")) {
                togglePanel(false);
                launcher.focus();
            }
        });

        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            var text = input.value.trim();
            if (!text) {
                return;
            }

            addMessage(body, text, "user");
            input.value = "";
            input.disabled = true;
            sendButton.disabled = true;

            var knownAnswer = answerFromKnowledgeBase(text);
            if (knownAnswer) {
                addMessage(body, knownAnswer, "bot");
                input.disabled = false;
                sendButton.disabled = false;
                input.focus();
                return;
            }

            var status = document.createElement("div");
            status.className = "yt-chat-status";
            status.textContent = "Loading guppyLM-9M (~10 MB on first use)...";
            body.appendChild(status);
            body.scrollTop = body.scrollHeight;

            var loaded = await loadModel();
            if (!loaded) {
                status.remove();
                addMessage(body, "Blub... my tiny model could not load. Try asking about Yutian's research, papers, awards, service, or open positions.", "bot");
            } else {
                status.textContent = "guppyLM-9M is thinking...";
                try {
                    var reply = await generateReply(text);
                    status.remove();
                    if (!reply || reply.length < 2 || /^[^a-zA-Z0-9]*$/.test(reply)) {
                        reply = "Blub... I'm only a tiny 9M fish. Try asking about Yutian's research, papers, awards, service, or open positions.";
                    }
                    addMessage(body, reply, "bot");
                } catch (error) {
                    console.error("guppyLM-9M inference failed:", error);
                    status.remove();
                    addMessage(body, "Blub... something went wrong. Please try a homepage-related question.", "bot");
                }
            }

            input.disabled = false;
            sendButton.disabled = false;
            input.focus();
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createWidget);
    } else {
        createWidget();
    }
}());
