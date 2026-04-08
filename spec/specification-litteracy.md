# Specification Literacy

## A Framework for Teaching Precise Thinking Through Algorithms and Agentic Coding

**Course: Introduction to Problem Architecture: Specification Literacy Through Algorithms and AI**

**Draft v2 · February 2026**

---

> **Abstract:** This document presents the philosophical foundation for a year-long 8th-grade course that teaches specification literacy — the discipline of describing problems precisely enough that any interpreter, human or machine, will produce the same result. We argue that specification literacy is a foundational skill on par with information literacy and data literacy, and that algorithms and AI-assisted coding provide an ideal medium for teaching it. The course uses a framework called the Verification Principle: working code is the beginning of the assignment, not the end. Students learn to specify requirements, generate solutions with AI, verify correctness against their specifications, and identify the limits of both their specifications and the solutions they produce. The underlying phenomenon — underspecification — is universal across disciplines, and the skills this course develops transfer to science, law, engineering, communication, and civic life.

---

## 1. The Case for Specification Literacy

Reading, writing, and arithmetic became universal educational requirements not because every student would become a novelist, essayist, or mathematician. They became requirements because these skills are prerequisite to meaningful participation in society. A citizen who cannot read cannot evaluate the claims made by those who govern them. A citizen who cannot write cannot articulate their own needs. A citizen who cannot reason quantitatively cannot assess whether a policy's promised benefits are plausible.

Over the past two decades, the concept of foundational literacy has expanded. Information literacy — the ability to find, evaluate, and use information — is now recognized as essential in an age of abundant and often unreliable media. Data literacy — the ability to read, interpret, and reason with quantitative evidence — has gained traction as decisions in every domain become increasingly data-driven. These are not niche technical skills; they are baseline competencies for informed citizenship.

We propose that a new foundational literacy is emerging with equal urgency: **specification literacy** — the ability to describe a problem, process, or desired outcome with sufficient precision that any interpreter will produce the same result.

This is not a new practice. Specification has been exercised in specialized domains for centuries. Legal drafting, engineering requirements, scientific protocols, and architectural blueprints are all forms of specification. What is new is the *universality* of the need. As artificial intelligence systems become general-purpose interpreters of human intent — generating code, writing documents, making decisions, and operating in the physical world — every person who interacts with these systems is, whether they know it or not, writing specifications.

The gap between what a person *means* and what they *specify* is where failures occur. This gap is not a technical problem. It is a human problem with technical consequences.

---

## 2. The Underspecification Problem

We define **underspecification** as a description that appears complete to its author because they unconsciously rely on context, assumptions, or defaults not shared by the interpreter. The critical word is *unconsciously*. The author of an underspecified description does not believe they have been ambiguous. The ambiguity is invisible from the inside. It becomes visible only when an interpreter — a colleague, a court, a different laboratory, an AI system — makes a different choice than the author intended.

This phenomenon is documented across every discipline that has studied it.

### 2.1 In Law

In 2017, the U.S. Court of Appeals for the First Circuit ruled that a missing Oxford comma in a Maine overtime statute created sufficient ambiguity to change the statute's meaning. The law exempted workers involved in "the canning, processing, preserving, freezing, drying, marketing, storing, packing for shipment or distribution of" certain foods. Without a comma after "shipment," it was unclear whether "distribution" was a separate exempt activity or part of "packing for shipment or distribution." The resulting settlement cost the employer $5 million.[^1]

The legal philosopher H.L.A. Hart described this phenomenon in 1958: natural language has a "core of certainty" and a "penumbra of doubt."[^2] Contract law exists, in substantial part, to manage the penumbra — to force parties to specify their assumptions before disputes arise. The entire field of statutory interpretation is a systematic response to underspecification in legal texts.

### 2.2 In Science

The reproducibility crisis in science is, in significant measure, an underspecification crisis. A 2016 survey in *Nature* found that more than 70% of researchers had failed to reproduce another scientist's experiments.[^3] While some irreproducibility reflects fraud or statistical errors, a substantial portion stems from methods sections that appear complete to their authors but contain unspecified parameters.

A 2021 paper in *BioTechniques* demonstrated that the common instruction "incubate at room temperature" is a specification failure. Laboratories vary from 18°C to 25°C depending on geography, season, and building design. For temperature-sensitive reactions — enzyme kinetics, microbial growth, RNA degradation — this range can alter experimental outcomes.[^4] The researcher writing "room temperature" believed the instruction was clear because their own laboratory's temperature felt obvious to them. The underspecification was invisible from the inside.

### 2.3 In Engineering

On September 23, 1999, NASA's Mars Climate Orbiter was destroyed during orbital insertion. The proximate cause was a unit mismatch: ground software produced by Lockheed Martin calculated thruster impulse in pound-force seconds, while NASA's trajectory software expected newton-seconds. The error was a factor of 4.45, accumulated over months of small trajectory corrections, and ultimately sent the spacecraft into the Martian atmosphere at 57 kilometers altitude instead of the intended 226 kilometers.[^5]

The interface specification did not explicitly state which unit system to use. Both teams used valid units. Both teams' software was internally correct. The failure was in the specification of the interface between them — a gap that both teams assumed was obvious and neither team documented. The cost was $125 million.

NASA's subsequent investigation identified the root cause not as a unit error but as a failure in systems engineering: the processes and reviews that should have caught the underspecification did not. The specification was not wrong — it was incomplete. And its incompleteness was invisible to the people who wrote it.

### 2.4 The Common Pattern

These examples span law, science, and engineering, but the underlying phenomenon is identical. In each case:

1. An author produced a description they believed was complete.
2. The description contained an ambiguity invisible to the author because they relied on context or assumptions they did not articulate.
3. An interpreter resolved the ambiguity differently than the author intended.
4. The divergence was discovered only after consequences materialized — a lawsuit, an irreproducible result, a destroyed spacecraft.

Every mature discipline has developed systematic practices for finding and eliminating underspecification. Law uses defined-terms sections. Science uses structured reporting guidelines (ARRIVE, CONSORT, PRISMA). Engineering uses requirements review processes and interface control documents. Aviation uses standardized phraseology and readback protocols. These practices share a common structure: they force the author to address known categories of ambiguity before the description reaches an interpreter.

We propose that **specification literacy** — the systematic practice of identifying and resolving underspecification — is a teachable, transferable skill, and that it merits recognition as a foundational literacy alongside information literacy, data literacy, and media literacy.

---

## 3. Why Algorithms Are the Ideal Medium

If specification literacy is the skill, why teach it through algorithms rather than through legal drafting, scientific protocol design, or technical writing?

Three properties of algorithmic problems make them uniquely suited as a pedagogical medium.

### 3.1 Immediate, Unambiguous Feedback

When a student writes a specification for an algorithm and an AI generates code from it, the code either meets the specification or it does not. The feedback is immediate, concrete, and unambiguous. A legal specification's ambiguity may not surface for years; a scientific protocol's underspecification may not be discovered until someone in a different laboratory attempts replication. An algorithmic specification's gaps are revealed in seconds when the program is executed against test cases.

This rapid feedback loop allows students to iterate on their specification skills in a single class session — write a spec, generate a solution, discover gaps, revise, regenerate. The cognitive cycle that takes months or years in professional practice can be compressed into minutes.

### 3.2 Formal Verification Is Possible

Algorithms are one of the few domains where correctness can be proved rather than merely estimated. A student can trace through a binary search on paper and explain why it must find the target if the target exists in a sorted list — or why it must correctly report "not found" if it does not. This is a genuine proof, accessible to an 8th grader, that develops the habit of requiring justification rather than accepting plausibility.

Most domains that require specification literacy do not permit this level of formal verification. You cannot prove that a law will be interpreted correctly in all future cases. You cannot prove that a scientific protocol will reproduce in all possible laboratories. But you can prove that a binary search algorithm is correct, and in doing so, you develop the disposition to seek proof wherever it is available and to recognize its absence where it is not.

### 3.3 AI Makes the Underspecification Visible

The introduction of AI coding assistants creates a pedagogical opportunity that did not exist when algorithms were taught through traditional programming instruction. When a student writes code themselves, they resolve their own ambiguities unconsciously as they type. They never see the ambiguity because they resolve it in real time without noticing.

When a student writes a specification and hands it to an AI, the AI resolves the ambiguities independently — and may resolve them differently than the student intended. The gap between intent and specification becomes visible. The student discovers that their "clear" description of the problem was, in fact, ambiguous. This discovery is the central learning event of the course.

In this sense, AI is not a shortcut or a crutch. It is a *pedagogical instrument* that makes underspecification observable. The AI's role is analogous to the role of a laboratory microscope: it makes visible what was previously invisible.

---

## 4. The Verification Principle

The course is organized around a single pedagogical norm:

> **The Verification Principle:** Working code is the beginning of the assignment, not the end. The AI can write the code. Your job is to prove it's correct, explain why it works, and know its limits.

This principle addresses the central concern educators raise about AI in the classroom: that students will outsource thinking to AI systems and fail to develop understanding. The Verification Principle does not pretend AI does not exist. It does not restrict AI use. Instead, it redefines what constitutes evidence of learning.

Under traditional instruction, evidence of understanding is the ability to produce a correct solution. Under the Verification Principle, evidence of understanding is the ability to:

1. **Specify** what a correct solution would look like, including edge cases and constraints, before any solution is generated.
2. **Evaluate** a generated solution against the specification, identifying where the solution meets, fails, or exceeds the requirements.
3. **Explain** why the solution is correct — not merely that it is correct, but what mechanism ensures its correctness.
4. **Identify limits** — the preconditions the solution requires, the cases it does not handle, the tradeoffs it embodies.

These four skills — specify, evaluate, explain, identify limits — require deeper understanding than production does. A student who can write a sorting algorithm from memory may be performing a rehearsed procedure. A student who can evaluate an unfamiliar sorting algorithm, explain why it works, and identify the conditions under which it fails has demonstrated genuine comprehension of the underlying principles.

### 4.1 The Calculator Analogy and Its Limits

The introduction of calculators in mathematics education was met with concern that students would stop learning arithmetic. What occurred was more nuanced: calculators shifted the locus of required understanding. Mental computation became less critical; the ability to determine which operation to apply, to estimate whether an answer is reasonable, and to interpret results in context became more critical.

AI and algorithms represent a similar shift, but at greater scale. The calculator automated arithmetic. AI automates a far broader range of cognitive tasks — writing, analysis, code generation, pattern recognition. The corresponding shift in educational emphasis must be proportionally broader. It is no longer sufficient to teach students to perform procedures. It is necessary to teach them to specify what procedures should accomplish, to verify that they accomplish it, and to understand why they work.

The Verification Principle is our answer to the question every educator must now confront: what does learning mean when AI can generate the outputs we traditionally used as evidence of learning?

---

## 5. Specification Literacy as Transferable Skill

Jeannette Wing's influential 2006 paper introduced the concept of "computational thinking" as a universally applicable skill set.[^6] We build on this foundation but propose a more specific claim: the transferable skill is not computational thinking broadly construed, but specification literacy specifically — the discipline of making assumptions explicit, testable, and verifiable.

The following table illustrates how specification literacy, as taught through algorithms in this course, transfers to other domains:

| In This Course | In Science | In Law & Civics | In Daily Life |
|---|---|---|---|
| Write a specification before asking the AI to generate code | Write a hypothesis and methods section before conducting an experiment | Draft contract terms before entering an agreement | Write precise instructions before delegating a task |
| Test against your spec, not against "does it seem to work" | Test against predicted outcomes, not against "do the results look reasonable" | Evaluate a policy against its stated objectives, not against anecdotal evidence | Evaluate whether a product does what the advertisement claimed |
| Find the ambiguities — places where your spec could be interpreted two ways | Identify uncontrolled variables that could confound results | Identify terms in a law that could be interpreted multiple ways | Recognize when instructions could be misunderstood |
| Explain why an algorithm is correct by tracing its logic | Explain why a result supports a hypothesis by tracing the evidence | Explain why a legal argument holds by tracing the reasoning | Explain why a decision was the right one by tracing the criteria |
| Identify what the algorithm cannot do or where it fails | Identify limitations of a study and conditions for external validity | Identify loopholes or unintended consequences of a policy | Identify what could go wrong with a plan |

The structural parallels are not metaphorical. They reflect the same cognitive operation applied in different contexts. A student who has practiced finding underspecification in their algorithmic specs is practicing the same skill a scientist uses when identifying uncontrolled variables, a lawyer uses when finding ambiguities in contract language, and a citizen uses when evaluating whether a policy's stated goals match its actual mechanisms.

---

## 6. AI as Collaborator, Not Crutch

The course positions students as lead collaborators with AI — not passive consumers of AI output and not adversaries trying to catch AI in errors. The relationship is modeled on the professional practice of code review, in which a senior engineer evaluates the work of a junior colleague. The AI generates. The student specifies, evaluates, and decides.

This framing is deliberately chosen to be future-proof. The specific AI tools available to schools will change year to year. A curriculum built around a particular tool's capabilities or limitations will become obsolete as the tool evolves. A curriculum built around the human skills of specification and verification remains valid regardless of how capable the AI becomes.

If the AI is imperfect and produces buggy code, the student practices debugging and correction. If the AI is flawless and produces perfect code, the student practices explanation and justification — proving that the code is correct, not just observing that it works. In either case, the student's task requires genuine understanding. The course's pedagogy does not depend on any particular level of AI capability.

### 6.1 The Question of Programming Languages

The course currently uses Python because it is widely supported, readable, and well-suited to STEM applications. However, the choice of programming language is explicitly secondary to the specification and verification skills the course teaches.

Crucially, students in this course *read and trace* code — they do not write it from scratch. The prerequisite is the ability to follow Python's logic, not the ability to produce syntactically correct programs. AI generates the code from student specifications; students verify, trace, and explain it. This distinction is fundamental. Writing code requires students to manage syntax, debugging, and language idioms simultaneously with the specification and verification skills the course teaches. Reading code isolates the skills that matter: understanding what the code does, why it is correct, and where it fails. The mechanical act of code production is delegated to AI, just as the mechanical act of arithmetic is delegated to a calculator in a statistics course.

A programming language is, at its core, a subset of human language that has been defined without ambiguity. It is a language in which every statement has exactly one interpretation. This is precisely what makes it useful as a medium for teaching specification: the contrast between the ambiguity of natural language specifications and the precision required by code makes the underspecification problem viscerally apparent to students.

If a new language emerges that is better suited to the course's pedagogical goals — or if AI systems evolve to accept natural language specifications directly — the course can adopt it without altering its philosophy. The foundational skill is specification literacy, not proficiency in any particular programming language.

### 6.2 The Question of AI Model Access

The course is designed to be model-agnostic. Lessons specify the nature of the AI interaction ("prompt the AI to generate a sorting algorithm that meets your specification") without prescribing a particular tool. A companion technical guide maps these interactions to specific tools and provides setup instructions for each.

Practical options for public school deployment include browser-based AI services with free tiers, locally hosted open-source models maintained by school IT departments, and education-specific AI tools as they become available. The curriculum accommodates any of these and can adapt as the landscape evolves. The guiding constraint is that the AI tool should be accessible, reliable, and appropriate for student use under applicable privacy and data protection regulations.

---

## 7. Ethics, Bias, and Specification

Questions of AI ethics and algorithmic bias are important and are addressed within the course. However, the course's philosophical framework offers a distinctive perspective: bias in AI systems is, in substantial part, an underspecification problem.

When a training dataset reflects demographic imbalances, the specification of that dataset was underspecified — it did not define the population it was intended to represent with sufficient precision, or the assumptions about representativeness were not made explicit. When a model produces outputs that reflect societal prejudices, the specification of the model's objectives was underspecified — the criteria for "correct" output did not account for equity, fairness, or the diversity of contexts in which the model would be deployed.

This is not to say that all bias is accidental or that specification alone can prevent it. Structural inequities, historical injustices, and power dynamics are substantive issues that exceed the scope of a specification. But the specification lens gives students a concrete, actionable framework for engaging with these issues: when an AI system produces biased outputs, one of the first questions to ask is "what was specified, what was assumed, and whose perspective was treated as the default?" This is the underspecification question applied at societal scale.

The course weaves ethical considerations into its existing pedagogy rather than treating them as a separate module. When students evaluate AI-generated solutions, they are asked not only "is this correct?" but "correct for whom, under what assumptions, and with what consequences?"

---

## 8. What Success Looks Like

### 8.1 For the Student

A student who completes this course can approach any problem — in STEM, in their community, in their future career — and ask: What exactly am I trying to solve? What would a correct solution look like? How would I verify that I got one? What assumptions am I making that I haven't stated?

They can work productively with AI tools without being dependent on them or deceived by them. They understand that AI-generated output requires the same verification as any other source of claimed truth — and they possess the skills to perform that verification.

They have developed the intellectual habit of seeking precision in their own communication and identifying imprecision in others'. This habit transfers to every discipline they encounter.

### 8.2 For the Institution

This course demonstrates that specification literacy can be taught as a core competency, not as an elective for students with pre-existing interest in technology. If the pilot succeeds, it provides a replicable model for other schools and districts.

The course also demonstrates a viable approach to AI in education — one that neither bans AI tools nor surrenders learning outcomes to them. The Verification Principle provides a framework that administrators, teachers, and parents can understand and endorse: AI is a tool, and we are teaching students to use it rigorously.

### 8.3 For Society

The long-term aspiration is a citizenry equipped to direct AI toward beneficial outcomes. This requires people who can specify what "beneficial" means in concrete, verifiable terms — who can translate values into specifications, evaluate AI systems against those specifications, and hold developers and deployers accountable for the gap between specification and reality.

A population that cannot specify what it wants from AI systems will get whatever the systems' developers specify for them. A population that can specify, verify, and evaluate will be able to participate meaningfully in decisions about how AI is developed, deployed, and governed.

---

## 9. What This Course Is Not

**This is not vocational training.** The course does not prepare students to be software engineers, though some will pursue that path. It prepares them to be precise thinkers and effective collaborators with AI tools, regardless of their career direction. Specification skills are no more specific to software engineering than essay-writing skills are specific to journalism.

**This is not "vibe coding."** Students do not prompt an AI and accept whatever it produces. The entire course is structured around the gap between "the AI produced something" and "I can prove this is correct and explain why." The Verification Principle ensures that AI use deepens rather than replaces understanding.

**This is not anti-AI.** The course does not teach students to fear or reject AI tools. It teaches them to use these tools with the same critical rigor they would apply to any powerful instrument — the same rigor a scientist applies to a microscope, an engineer to a simulation, or a lawyer to a precedent.

**This course supersedes AP Computer Science A, not supplements it.** Every generation of programming abstraction has redefined the human's role. Assembly programmers managed registers and memory addresses. C programmers managed types and pointers. Java programmers managed objects and inheritance. At each transition, the previous generation's core skill became a detail handled by the new abstraction layer, and the human's job moved up — from managing machine state, to managing program structure, to managing system design. Specification with AI is the next such transition. The human specifies *what* the solution must do and *why* it is correct. The AI handles *how* — the syntax, the implementation details, the language-specific idioms. This is the same relationship Java has to bytecode, or that bytecode has to binary. It is a full level of abstraction higher.

AP CS A remains anchored at the Java layer. It teaches students to be the translator — to convert algorithmic intent into syntactically correct code in a specific language. This course teaches students to be the architect — to define what needs to be built, verify that it was built correctly, and understand why the design works. The architect must understand construction principles (algorithms, data structures, efficiency) but their primary skill is specification and verification, not the manual production of code.

This distinction matters for STEM education specifically. Scientists, engineers, and researchers routinely write programs for data analysis — processing novel datasets, modeling complex systems, running simulations. These professionals need to design deterministic analysis systems and verify their correctness. They have never needed, and will decreasingly need, to write syntactically perfect code by hand. The AI will write the code. The STEM professional will write the specification, evaluate the output, and take responsibility for the result. That is exactly the skill this course teaches.

A student who completes this course covers the same algorithmic topics as AP CS A — and more broadly, since the course is not constrained by a single language's idioms. But they engage with those topics at the specification and verification layer rather than the syntax layer. They are better prepared not only for further study in computer science, but for any discipline where precise thinking about complex systems is required.

---

## 10. Course Structure at a Glance

The course is designed for a full academic year on a modern block schedule (one 45-minute session and two 90-minute sessions per week). It is organized into three acts that define the student's evolving role:

| | Focus | Student Role | AI Role |
|---|---|---|---|
| **Act 1** (Semester 1, first half) | Foundations. What is an algorithm? What is a specification? How do you talk to an AI about problems? How do you verify what it gives you? | Consumer and critic of AI-generated solutions. Learning the vocabulary and tools of specification. | Generator. The AI produces solutions that students evaluate and interrogate. |
| **Act 2** (Semester 1, second half) | Patterns. Sorting, searching, data structures, efficiency. Core algorithmic concepts, taught through the specification-verification lens. | Co-author with AI. Students write increasingly complex specifications and evaluate increasingly complex solutions. | Collaborator. Students iterate with the AI, refining specifications and solutions together. |
| **Act 3** (Semester 2) | Agency. Students direct AI through multi-step pipelines, applying algorithms to real-world STEM data and culminating in a capstone project. | Lead collaborator. Students define problems, choose approaches, verify correctness, and present results. | Tool under student direction. Students decide when, how, and whether to use AI for each aspect of their work. |

### 10.1 The Spiral Principle

The course employs a spiral design in which the same algorithms recur at increasing levels of complexity. A sorting algorithm introduced in Act 1 with clean integer data returns in Act 2 with strings, mixed-case text, and compound objects, and again in Act 3 with messy real-world datasets. Each iteration reveals underspecification in the student's previous work — the specification that was sufficient for integers breaks when the data includes null values, mixed types, or culturally dependent ordering rules.

This is not repetition. It is the experience of discovering that a problem you thought you solved just broke because the world got more complicated. The surprise is pedagogically productive: it demonstrates that specification is not a one-time act but an ongoing discipline that must evolve as context changes.

### 10.2 The Dataset Strategy

Each unit uses a hybrid dataset approach. A home dataset — initially drawn from NOAA local climate records — recurs across multiple units, providing continuity and allowing students to observe how different algorithms reveal different properties of familiar data. New datasets are introduced per unit for variety and cross-curricular relevance, connecting algorithmic concepts to science, social studies, and other disciplines.

Within each unit, the rhythm is abstract-first, then STEM-applied. Students encounter an algorithm with clean, controlled data to isolate the specification and verification skills. They then apply the same algorithm to messier, domain-specific data — climate measurements, demographic records, sensor readings — where the underspecification challenges multiply. Students do not need domain expertise; the domain knowledge lives in the specification. This approach exposes students to bioinformatics, climate modeling, signal processing, and other fields without requiring prerequisites in any of them.

### 10.3 The Act 3 Capstone

The capstone project in Act 3 is a student-defined automated research report. The student specifies a research question, defines the report's structure and requirements, and directs AI through a multi-step pipeline: data acquisition, analysis, visualization, and narrative generation. The student's role is architect and verifier — designing the pipeline, specifying what each step must produce, and verifying correctness at each stage.

The assessed deliverable is the verification journal, not the report. The report is evidence that the pipeline ran; the journal is evidence of understanding. A polished report produced without specification rigor or verification discipline earns a failing mark. A rough report accompanied by meticulous specification and thorough verification demonstrates exactly the skills the course teaches.

### 10.4 Assessment

Assessment is pass/fail, with LLM-assisted evaluation and teacher authority. Student work is evaluated through accumulated journals demonstrating four qualities: specification clarity, verification rigor, explanatory depth, and awareness of limits. The LLM serves as an attention-multiplier for the teacher — pre-annotating student work against a rubric — while the teacher retains all evaluative authority.

AI collaboration is the medium of the course, not a separately assessed skill. An excellent specification, written on paper, merely needs to be transcribed to become an effective prompt. Specification quality *is* prompt quality, and there is no need to evaluate them as separate dimensions.

### 10.5 Differentiation and Prior Experience

A common concern: does the course advantage students with prior programming experience? In practice, the opposite may be true. Students who have written code before may have developed the habit of accepting working code as sufficient evidence of correctness. This course explicitly rejects that assumption — working code is the *beginning* of the assignment, not the end.

Meanwhile, students with no coding background are not disadvantaged because they are never asked to produce code. They are asked to read it, trace it, explain it, and verify it against their specifications. The specification skills are new to all students regardless of technical background. The course levels the playing field by shifting the assessed skill from code production (where experience creates advantage) to specification and verification (where experience confers no head start).

---

## 11. Implications for Existing Curriculum

A natural concern for teachers and administrators: if students arrive at high school with specification literacy, what happens to the courses they enter? Does this create more work for already overburdened teachers? Does it disrupt existing curricula?

Before addressing these questions, a clarification of scope. The advocacy in this document is for **specification literacy as a foundational competency**, not for this specific course as a mandatory requirement. This course is a proof of concept — a demonstration that specification literacy can be taught systematically through algorithms and AI. The competency itself could, in principle, be developed through multiple pathways: scientific methods, legal reasoning, technical writing, or other disciplines that grapple with underspecification. Our claim is that algorithms are an unusually effective medium because of the immediate feedback, formal verifiability, and AI-assisted visibility of gaps they provide. But the goal is the competency, not the course.

With that framing established:

The short answer is that specification literacy makes students better at skills other courses already require — without requiring those courses to change. The longer answer requires examining the effects by department.

### 11.1 What Improves Without Any Curriculum Changes

Specification literacy is not domain-specific knowledge that conflicts with existing instruction. It is a *disposition* — a habit of precise thinking that students bring with them. In practice, this means:

**In science,** students arrive already understanding that "heat the solution" is underspecified and that a reproducible protocol requires exact temperatures, durations, and equipment. Lab reports improve. The perennial teacher complaint that students cannot write a clear methods section is partially addressed before the student walks through the door. The science teacher does not need to teach specification — they benefit from it having been taught.

**In mathematics,** the transition from computation to proof is one of the most difficult conceptual shifts in secondary education. Students with specification literacy have spent a year practicing "explain *why* this is correct, not just *that* it is correct" through algorithm tracing. The disposition toward formal justification — the expectation that a claim requires a mechanism, not just a demonstration — transfers directly to geometric proofs, algebraic reasoning, and statistical inference.

**In English language arts,** argumentative writing requires precisely stated claims supported by evidence that addresses those specific claims — not adjacent ones. The specification discipline ("does my thesis say what I think it says, or could a reader interpret it differently?") maps directly to thesis construction and evidence evaluation. The peer review skills from the algorithms course transfer to writing workshops.

**In social studies and civics,** policy analysis requires evaluating whether a law's mechanisms actually achieve its stated objectives — which is the specification-verification loop applied to governance. Students who have studied the Oxford comma case and the Mars orbiter arrive with concrete examples of how imprecise language produces unintended consequences. These examples enrich civics instruction without requiring curriculum changes.

In each case, the effect is additive. Teachers receive students with stronger analytical habits. No existing lesson needs to be removed or modified to accommodate this.

### 11.2 The Honest Acknowledgment: CS Courses Will Need to Evolve

The one area where specification literacy does create productive tension is in existing computer science instruction. A student who has spent a year specifying requirements and verifying AI-generated solutions at the architect level may find it less engaging to hand-write Java syntax for a sorting algorithm they could specify in three sentences and have an AI produce in seconds.

This is not a problem with the student or with this course. It is signal that the CS curriculum is teaching at an abstraction layer that is becoming, like assembly language before it, a specialist concern rather than a general requirement.

This has happened before. When students arrived at high school proficient with calculators, math courses that spent weeks on long division by hand felt misaligned. The response was not to stop teaching arithmetic — it was to evolve the curriculum upward, spending less time on mechanical computation and more time on problem formulation, estimation, and interpretation. The same evolution is due in computer science education.

In the interim, students with specification literacy will likely perform well in existing CS courses — they understand the underlying algorithms and need only learn the language-specific syntax. The conceptual foundation is in place; the mechanical skill can be acquired quickly. The relationship is analogous to a musician who understands theory sitting down to learn a new instrument: the fingering is new, but the music is already understood.

Over time, we anticipate that high school CS courses will shift emphasis from code production toward specification, verification, and system design — the same shift this course introduces at the middle school level. This course may accelerate that transition by producing students who expect and benefit from instruction at the specification layer.

### 11.3 What This Does Not Require of Other Teachers

To be explicit about what this course does *not* ask of colleagues in other departments:

- **No new content.** Other courses do not need to add specification or algorithms to their curriculum.
- **No new tools.** Other teachers do not need to adopt AI tools or learn Python.
- **No coordination overhead.** The course is designed with lightweight, optional STEM hooks that can be activated if cross-curricular coordination is desired, but function is not dependent on it.
- **No additional assessment burden.** The specification skills transfer passively through student disposition, not through explicit cross-curricular requirements.

The only ask of the broader faculty is awareness: if students begin asking more precise questions about assignments, pushing back on ambiguous instructions, or requesting clearer evaluation criteria, that is the specification literacy at work. It should be welcomed, not treated as insubordination.

---

## 12. Conclusion

The question this course answers is not "should students learn to code?" It is: in a world where AI systems interpret human intent at scale, what skills must every person have to maintain agency over the systems that act on their behalf?

Our answer is specification literacy: the ability to describe what you want precisely enough that any interpreter — human or machine — will produce the same result. The ability to find the assumptions you didn't know you were making. The ability to verify that what you received is what you needed, not merely what you asked for.

Algorithms provide the ideal medium for teaching this skill because they offer immediate feedback, permit formal verification, and — when combined with AI coding assistants — make the underspecification problem viscerally visible. But the skill itself is not about algorithms. It is about the precision of thought and communication that every discipline demands and that the age of AI makes indispensable.

Reading gave citizens access to the ideas of others. Writing gave citizens the ability to articulate their own. Numeracy gave citizens the ability to evaluate quantitative claims. Specification literacy gives citizens the ability to direct the most powerful tools humanity has ever built — and to verify that those tools are doing what was asked of them, not merely what was assumed.

---

## Notes

[^1]: O'Connor v. Oakhurst Dairy, 851 F.3d 69 (1st Cir. 2017). Settled for $5 million in 2018.

[^2]: H.L.A. Hart, "Positivism and the Separation of Law and Morals," *Harvard Law Review* 71(4), 593–629 (1958).

[^3]: Baker, M. "1,500 scientists lift the lid on reproducibility." *Nature* 533, 452–454 (2016).

[^4]: Teixeira da Silva, J.A. "Room Temperature in Scientific Protocols and Experiments Should be Defined: a Reproducibility Issue." *BioTechniques* 70(6), 307–309 (2021).

[^5]: Mars Climate Orbiter Mishap Investigation Board Phase I Report, NASA, November 10, 1999.

[^6]: Wing, J.M. "Computational Thinking." *Communications of the ACM* 49(3), 33–35 (2006).