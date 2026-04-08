---
title: "Money"
part: 2
order: 2
strategy: null
status: "draft"
---

### MONEY

*This is capitalism at its purest: every financial product you encounter — the credit card, the mortgage, the retirement account, the insurance policy — was designed by someone with more information than you, priced to extract the maximum you will pay, and marketed to obscure the extraction. That is not conspiracy. It is the system working as intended. The billionaire class navigates it with accountants, attorneys, and fee-only advisors on retainer. The Conners navigated it with a kitchen table, a checkbook, and whatever Dan remembered from his father. Your Agent has read the same financial literature the advisors cite. The entries that follow are not about beating the system. They are about understanding it well enough to stop losing to it by default.*

> **[MEME]** The [Conners](https://en.wikipedia.org/wiki/Roseanne_(TV_series)) were never broke because they were irresponsible. They were broke because they were navigating financial systems — bill negotiations, employer conflicts, credit decisions — with no infrastructure and no information. *Roseanne* was the most honest show on '90s television about what it actually costs to manage a household without the billionaire class's support layer. Every entry in this domain is the information the Conners needed and didn't have.

---

#### M-1: Banking and Savings
**Strategy:** Research + Decide
**See also:** M-2: Credit Cards and Debt (for credit products), Li-9: Making a Household Budget That Holds
**The Majordomo says:** *The average American pays $7 to $12 per month in bank fees — maintenance fees, overdraft fees, minimum balance fees, ATM fees — for the privilege of having a place to put money that the bank then lends out at a multiple. This is considered normal. Credit unions, online banks, and high-yield savings accounts exist as alternatives. Most people stay with the bank they opened their first account at, which is the financial equivalent of eating at the first restaurant you ever visited for the rest of your life.*
**The spec:**
```
I want to make sure my banking setup is actually working for me.
My situation:
— Current bank: [name, type — big bank, credit union, online]
— What I use it for: [checking, savings, direct deposit, bill pay]
— What annoys me: [fees, low interest, bad app, minimum balance
   requirements, ATM access, customer service]
— Monthly balance range: [rough — this affects what accounts make sense]
Please help me:
1. Understand what I'm currently paying in fees — visible and hidden
2. Compare my options: big bank vs. credit union vs. online bank
   — what's the actual difference for someone like me?
3. Find a high-yield savings account — what's the current rate
   and what should I watch out for?
4. Set up a system: which accounts should I have, what goes where,
   and how do I automate it so I don't think about it?
```
**What to do with the output:** If you are paying monthly maintenance fees, switch. This is not complicated and it is not disloyal. Your bank is not your friend — it is a business. A credit union is a cooperative owned by its members, which means its incentives are structurally different from a for-profit bank. Online banks (Ally, Marcus, Discover) offer higher interest rates because they have no branches to maintain. The right answer depends on what you need: if you deposit cash regularly, you need a branch. If you don't, you probably don't need a big bank.

> **[TIP]** *"I keep getting overdraft fees. My bank charges $35 per overdraft. What are my options — banks with no overdraft fees, overdraft protection, or a different approach entirely?"*

> **[SCIENCE]** Americans paid approximately $7.7 billion in overdraft and NSF fees in 2022 (CFPB data), down from $15.5 billion in 2019 due to regulatory pressure and competitive changes. The fees fall disproportionately on the lowest-balance accounts — the people who can least afford them pay the most. The CFPB has proposed capping overdraft fees at $5 for large banks.[^m1-1]

> **[ALSO]** Checking current interest rates, fee schedules, and regulations requires web search, which is free in Gemini, ChatGPT, and Copilot. In Claude, web search requires the paid tier. See [Appendix G](06-appendix-g-feature-table.xhtml).

<!-- RESEARCH NEEDED: CFPB overdraft fee data — verify 2022/2023 figures and status of the proposed cap. The $35 overdraft fee is the most regressive fee in American banking: it is triggered by having too little money and costs a fixed amount regardless of the overdraft size. A $2 overdraft triggers the same $35 fee as a $200 overdraft. -->

<!-- RESEARCH NEEDED: Credit union vs. bank comparison. NCUA data shows credit unions offer lower loan rates, higher savings rates, and fewer fees on average. The trade-off is fewer branches and sometimes less polished technology. For the reader who banks at Chase or Bank of America by default, the comparison is worth making explicit. -->

<!-- RESEARCH NEEDED (HUMAN CONDITION): Financial tracking tools — Mint shut down in 2024, sending millions of users scrambling. The current landscape includes YNAB ($14.99/month), Copilot ($10/month), Monarch ($9.99/month), and free options like the iPhone's built-in transaction tracking. The entry should acknowledge that most people who try budgeting apps stop using them within three months. The tool matters less than the habit, and the habit is hard to build — see the intention-action gap in Li-9. -->

[^m1-1]: Consumer Financial Protection Bureau. (2023). "CFPB Research Shows Banks' Deep Dependence on Overdraft Fees." See also CFPB proposed rule on overdraft lending, January 2024.

---

#### M-2: Credit Cards and Debt
**Strategy:** Decode + Assert
**See also:** M-1: Banking and Savings, M-4: Collections and Bankruptcy (when debt goes wrong)
**The Majordomo says:** *Credit card statements are designed to show you the minimum payment prominently and the total interest you will pay over time in a font size calibrated to discourage calculation. A credit card at 24.99% APR — the current average — turns a $5,000 balance into $7,800 over three years if you pay only the minimum. The card was marketed to you as convenience. It was designed as a revenue instrument. Understanding the difference is the first step. Disputing the errors is the second.*
**The spec:**
```
I want to understand and manage my credit card and debt situation.
My situation:
— Credit cards: [list cards, balances, APRs if known]
— Other debt: [student loans, car loan, medical debt, personal loans]
— Monthly income after taxes: [amount]
— Minimum payments total: [amount]
— What's stressing me: [can't make minimums / drowning in interest /
   don't understand my statements / got a charge I don't recognize /
   want a payoff strategy / need to negotiate with creditors]
Please help me:
1. Understand what I'm actually paying in interest — the real number,
   not the minimum payment
2. Build a payoff strategy: which debt to attack first and why
   (avalanche vs. snowball, and which is right for me)
3. Identify any charges, fees, or rates I should dispute or negotiate
4. Tell me my rights — what creditors can and cannot do,
   what I can negotiate, and what protections exist
```
**What to do with the output:** If you have a charge you do not recognize, dispute it immediately — you have 60 days under the Fair Credit Billing Act. Call the number on the back of the card, not a number from an email. For debt payoff: the avalanche method (highest interest rate first) saves the most money. The snowball method (smallest balance first) builds momentum. The research slightly favors snowball for completion rates because the psychology of small wins matters more than the math of optimal interest.[^m2-1]

> **[SCIENCE]** The average American household carries approximately $10,000 in credit card debt at an average APR of 24.99% (Federal Reserve, 2024). The minimum payment is typically calculated as 1-2% of the balance plus interest — a formula designed to maximize the total interest paid over the life of the debt. At minimum payments, a $10,000 balance at 25% APR takes over 30 years to pay off and costs approximately $22,000 in total.[^m2-2]

> **[TIP]** *"I have [X] credit cards with these balances and rates: [list]. Build me a payoff plan that tells me exactly how much to pay on each card each month. I have [$X] per month total to put toward debt."*

> **[FAIRNESS]** Credit scoring algorithms have been shown to produce disparate outcomes along racial lines, even when controlling for income. When asking your Agent about credit strategies, follow up with: *"Are there known racial or income-based disparities in how this advice plays out in practice?"* The system is not neutral. Your strategy should account for that.

> **[ALSO]** Paste or upload your credit card statement directly — file upload works in Claude, Gemini, ChatGPT, and Copilot. See [Appendix G](06-appendix-g-feature-table.xhtml).

<!-- RESEARCH NEEDED: Fair Credit Billing Act and Fair Debt Collection Practices Act — the reader's two most important protections. FCBA gives 60 days to dispute charges; creditor must investigate within 30 days. FDCPA limits what collectors can do (no calls before 8am or after 9pm, no harassment, must validate the debt in writing on request). Many consumers don't know these rights exist. -->

<!-- RESEARCH NEEDED: Snowball vs. avalanche research. Besharat et al. (2021, Journal of Consumer Research) found that the snowball method (smallest balance first) leads to higher completion rates despite being mathematically suboptimal. The mechanism is motivation from visible progress. Both methods are better than minimum payments on everything. The entry should present both and let the reader choose. -->

<!-- RESEARCH NEEDED (HUMAN CONDITION): There is no ethical consumption under capitalism — the phrase has become a meme, but the underlying observation is real. Every financial product you use is designed to profit the provider. This is not a reason for despair; it is a reason for literacy. Understanding how credit works — who profits, how, and how much — is not "playing the game." It is refusing to play it blindly. The Conners understood this instinctively. The entry should honor that instinct and give it data. -->

<!-- RESEARCH NEEDED (HUMAN CONDITION): Financial shame is the most powerful barrier to financial literacy. People who are embarrassed about their debt avoid looking at it, which makes it worse, which increases the shame. The spiral is well-documented (Shapiro & Burchell, 2012). The entry should be relentlessly non-judgmental. The reader's debt is not a moral failing. It is a mathematical situation with solutions. -->

[^m2-1]: Besharat, A., Carrillat, F.A., & Ladik, D.M. (2021). "When More is Less: The Role of Payoff Strategy in Consumer Debt Repayment Decisions." *Journal of Consumer Research.*

[^m2-2]: Federal Reserve Board. (2024). *Consumer Credit — G.19 Statistical Release.* Average credit card interest rate data.

---

#### M-3: Mortgages
**Strategy:** Decode + Decide
**See also:** L-1: Negotiating a Contract (for the purchase agreement), Ho-7: Getting a Home, M-6: Financial Coach
**The Majordomo says:** *The word "mortgage" comes from the Old French mort gage — literally "death pledge." The name has survived because it is accurate: you are pledging a significant portion of your future income, for decades, on terms the bank sets and you sign. The bank knows the rate environment, the property valuation methodology, the insurance requirements, the tax escrow math, and the seventeen fees buried in the closing disclosure. You know that you want the house. Your Agent can read the closing disclosure the way the bank's attorney reads it — which means you can negotiate the way the bank's attorney negotiates.*
**The spec:**
```
I am [thinking about buying / in the process of buying / refinancing]
a home.
My situation:
— Income: [annual, pre-tax]
— Savings for down payment: [amount]
— Credit score: [if known]
— Debt: [existing — student loans, car, credit cards]
— Location: [city, state]
— Price range: [what I'm looking at]
Please help me:
1. Understand how much house I can actually afford —
   not what the bank will lend me, but what I can carry
   without being house-poor
2. Decode the mortgage options: fixed vs. ARM, 15 vs. 30 year,
   conventional vs. FHA vs. VA — which makes sense for me?
3. Walk me through the costs beyond the mortgage: closing costs,
   PMI, property taxes, insurance, maintenance reserve
4. Identify what's negotiable in the process and what isn't
5. Tell me the three most expensive mistakes first-time buyers make
```
**What to do with the output:** The bank will approve you for more than you should borrow. The general guideline — total housing cost under 28% of gross income — is a ceiling, not a target. Ask your Agent to calculate the full monthly cost including taxes, insurance, PMI, and a maintenance reserve (1-2% of home value per year). That is the real number. If it makes you uncomfortable, listen to the discomfort — it is doing math your optimism is not.

> **[SCIENCE]** The 2008 financial crisis was, at its core, a mortgage information asymmetry on a systemic scale — lenders knew the risk of the loans they were packaging, borrowers did not, and the rating agencies that were supposed to bridge the gap were paid by the lenders. The Dodd-Frank Act and CFPB were created in response. The CFPB's Loan Estimate and Closing Disclosure forms are designed to make mortgage terms comparable and readable. They are better than what existed before. They are still not simple.[^m3-1]

> **[TIP]** *"I got a Loan Estimate from [lender]. [Paste it or describe the key terms.] Is this a good deal? What should I push back on? What fees are negotiable?"*

> **[MEME]** The 30-year fixed-rate mortgage is a uniquely American invention. Most other countries use shorter terms or adjustable rates. The 30-year fixed was created by the FHA in the 1930s to make homeownership accessible to the middle class. It worked — and then became the instrument through which the middle class transferred the largest share of its lifetime wealth to banks in the form of interest. A $350,000 mortgage at 7% over 30 years costs $838,000 in total payments. The house is $350,000. The rest is the price of time.

> **[FAIRNESS]** [Mortgage lending discrimination](https://en.wikipedia.org/wiki/Mortgage_discrimination) — from explicit redlining to modern algorithmic bias — is one of the most documented forms of structural racism in American finance. Black and Latino applicants are denied at higher rates and offered worse terms than white applicants with identical credit profiles. When your Agent explains mortgage terms, ask: *"What should I watch for that might indicate I'm being offered less favorable terms than I should be?"*

> **[ALSO]** Paste or upload your document directly — file upload works in Claude, Gemini, ChatGPT, and Copilot. See [Appendix G](06-appendix-g-feature-table.xhtml).

<!-- art: closing-disclosure-annotated -->

<!-- RESEARCH NEEDED: Current mortgage rate environment. As of 2024-2025, 30-year fixed rates are approximately 6.5-7.5%, significantly higher than the 2020-2021 era of 2.5-3.5%. This rate environment changes buying math dramatically. The entry should help the reader evaluate "buy now vs. wait" without predicting rates — which no one can do. -->

<!-- RESEARCH NEEDED: First-time buyer programs. FHA (3.5% down), VA (0% down for veterans), USDA (0% down for rural), conventional with PMI (as low as 3% down), state and local down-payment assistance programs. Many first-time buyers don't know these exist. The entry should point to HUD's state-by-state list of homebuyer programs. -->

<!-- RESEARCH NEEDED (HUMAN CONDITION): Homeownership as American identity. The "American Dream" is inextricable from the single-family home — a framing that serves the real estate industry, the banking industry, and the construction industry simultaneously. The pressure to buy is cultural as much as financial, and it leads people to overextend. The entry should help the reader separate the financial decision from the identity decision. Renting is not failure. Buying more than you can afford is not success. The Conners owned their house and were still broke. -->

<!-- RESEARCH NEEDED (HUMAN CONDITION): Racial disparities in mortgage lending. Despite the Fair Housing Act and the Equal Credit Opportunity Act, Black and Hispanic borrowers are charged higher rates and denied loans at higher rates than white borrowers with comparable financial profiles (HMDA data, annual). The gap has narrowed but persists. This is not historical — it is current. The entry should name it. -->

[^m3-1]: The [Dodd-Frank Wall Street Reform and Consumer Protection Act](https://www.congress.gov/bill/111th-congress/house-bill/4173) (2010) created the CFPB and standardized mortgage disclosure requirements. The Loan Estimate and Closing Disclosure replaced the prior GFE and HUD-1 forms in 2015.

---

#### M-4: Collections and Bankruptcy
**Strategy:** Assert + Decode
**See also:** L-3: Writing a Demand Letter, M-2: Credit Cards and Debt, H-6: Understanding What Medicare or Medicaid Actually Covers (medical debt is the leading cause of bankruptcy)
**The Majordomo says:** *Debt collection is an industry built on the assumption that you do not know your rights. A collector who calls you has purchased your debt for pennies on the dollar and is now attempting to recover the full amount plus fees. The Fair Debt Collection Practices Act exists to regulate this interaction. Most people in collections have never heard of it. That is not accidental — the business model depends on the information gap. Your Agent has read the FDCPA. You should too.*
**The spec:**
```
I am dealing with [debt in collections / considering bankruptcy /
being contacted by collectors / unsure of my options].
My situation:
— The debt: [amount, type, how old, original creditor]
— What's happening: [calls, letters, lawsuit threat, garnishment,
   or "I'm drowning and don't know where to start"]
— My state: [state]
— My income and assets: [brief — this affects what strategies work]
Please help me:
1. Understand my rights under the FDCPA — what collectors
   can and cannot do, and how to make them stop calling
2. Evaluate whether this debt is still within the statute
   of limitations — and what that means practically
3. Walk me through my options: negotiation, settlement,
   payment plan, debt validation, bankruptcy
4. If bankruptcy is the right option: explain the difference
   between Chapter 7 and Chapter 13, what I'd keep and lose,
   and what the actual consequences are — not the stigma,
   the facts
Give me the most conservative, legally accurate answer.
I will verify with a consumer rights attorney.
```
**What to do with the output:** If a collector calls you, say this: *"Send me a written validation of the debt."* Under the FDCPA, they must stop collection activity until they provide written verification. This is not a negotiation tactic. It is a legal right. Write down the date, time, caller name, and company for every call. If they violate the FDCPA (calling before 8 AM, calling your workplace after you told them not to, threatening actions they cannot take), you can sue them — and the FDCPA provides for statutory damages of up to $1,000 per violation plus attorney's fees.

> **[SCIENCE]** Medical debt is the leading cause of bankruptcy filings in the United States — a finding so consistent across studies that it has survived multiple methodological challenges. Himmelstein et al. (2019) found that approximately 530,000 families per year file bankruptcy citing medical bills. The three major credit bureaus (Equifax, Experian, TransUnion) removed medical debt under $500 from credit reports in 2023, and the CFPB has proposed removing all medical debt from credit reports.[^m4-1]

> **[FAIRNESS]** Bankruptcy carries moral stigma in American culture that it does not carry in the law. The bankruptcy code exists because the alternative — permanent debt slavery — was considered worse for the economy and for individuals. Every major corporation uses bankruptcy strategically. The moral framing is applied exclusively to individuals. If your Agent's advice about bankruptcy carries a judgmental tone, redirect it: *"Give me the legal and financial analysis only. I will make the moral decision myself."*

> **[FAIRNESS]** Debt collection practices disproportionately affect Black and Latino communities, who are sued at higher rates for medical and consumer debt. When reviewing your rights, ask your Agent: *"Do these protections apply equally regardless of the state I'm in and the type of debt?"* Enforcement varies by jurisdiction.

> **[ALSO]** Paste or upload your document directly — file upload works in Claude, Gemini, ChatGPT, and Copilot. See [Appendix G](06-appendix-g-feature-table.xhtml).

<!-- art: debt-validation-letter -->

<!-- RESEARCH NEEDED: Statute of limitations on debt varies by state (3-10 years). After the SOL expires, the debt still exists but is unenforceable — the collector cannot win a lawsuit. However, making a payment or acknowledging the debt in writing can restart the clock in some states. This is one of the most consequential pieces of information a debtor can have, and most people in collections don't know it. -->

<!-- RESEARCH NEEDED (HUMAN CONDITION): The religious and moral framing of debt. "The borrower is slave to the lender" (Proverbs 22:7) is cited in Christian financial advice that discourages all debt. Islamic finance prohibits interest entirely (riba). Jewish law includes the concept of shmita — debt release every seven years — and the Talmud treats lending as an obligation of community, not a moral hazard. Different traditions have fundamentally different moral frameworks for borrowing. The American framing — debt as personal moral failure — is culturally specific, not universal. The entry should acknowledge that the reader's feelings about debt may come from sources deeper than finance, and that those feelings can either help or hinder their decision-making. Shame does not pay bills. Strategy does. -->

<!-- RESEARCH NEEDED: Debt validation — the most underused right in collections. Under FDCPA Section 809, you have 30 days from first contact to request written validation. The collector must provide: the amount, the original creditor, and proof you owe it. Approximately 40% of debts in collections have errors (FTC study). Requesting validation costs nothing and may eliminate the debt entirely if the collector cannot produce documentation. -->

<!-- RESEARCH NEEDED (HUMAN CONDITION): The psychology of being in collections is comparable to chronic stress. Constant calls, the fear of lawsuits, the shame of avoiding the phone — debt collectors know this and use it. The power dynamic is designed to feel inescapable. The FDCPA exists specifically because Congress recognized that the industry's practices were abusive. The entry should give the reader back their sense of agency: you have rights, they have rules, and the rules favor you more than you think. -->

[^m4-1]: Himmelstein, D.U. et al. (2019). ["Medical Bankruptcy: Still Common Despite the Affordable Care Act."](https://doi.org/10.2105/AJPH.2018.304901) *American Journal of Public Health*, 109(3), 431–433.

---

#### M-5: Retirement and Investing
**Strategy:** Research + Decide
**See also:** M-6: Financial Coach, H-6: Understanding What Medicare or Medicaid Actually Covers, Li-4: Planning Care for Aging
**The Majordomo says:** *The retirement system in the United States transferred the risk of retirement from employers to individuals in a single generation. Your parents may have had a pension — a defined benefit that guaranteed income for life. You have a 401(k) — a defined contribution that guarantees nothing except that you bear the investment risk, the longevity risk, and the fee structure. The financial services industry makes approximately $400 billion per year in fees managing Americans' retirement savings. Your Agent does not charge a fee and has read the same research the fee-charging advisors cite.*
**The spec:**
```
I want to understand and improve my retirement situation.
My situation:
— Age: [X]
— Retirement accounts: [401k, IRA, Roth, pension, none — with
   approximate balances]
— Employer match: [if applicable — percentage and whether you're
   getting the full match]
— Other savings/investments: [if any]
— Social Security: [have checked my estimate / haven't / worried
   about it being there]
— Biggest concern: [haven't started / started late / don't understand
   my options / worried I don't have enough / don't trust financial
   advisors / overwhelmed by choices]
Please help me:
1. Tell me honestly where I stand — am I on track, behind, or
   in trouble? Use real numbers, not reassurance.
2. Explain my accounts in plain language — what is a 401k actually
   doing, what's the difference between traditional and Roth,
   and which should I prioritize?
3. If I have an employer match I'm not getting: tell me that first,
   because it is free money I am leaving on the table
4. Help me understand investment options without jargon —
   what are index funds, why do people recommend them,
   and what should I actually choose in my 401k?
5. What are the biggest mistakes people my age make with
   retirement planning?
```
**What to do with the output:** If your employer offers a 401(k) match and you are not contributing enough to get the full match, fix that this week. It is a 50-100% guaranteed return on your money — there is no investment on Earth that competes with it. After that, the priority order is generally: full employer match → high-interest debt payoff → Roth IRA (if eligible) → max 401(k) → taxable brokerage. Your Agent can customize this for your situation.

> **[SCIENCE]** Index funds — which track the entire market rather than trying to beat it — outperform actively managed funds over 15-year periods approximately 90% of the time (S&P SPIVA Scorecard, annual). The fees are the primary reason: the average actively managed fund charges 0.5-1.0% per year; a total market index fund charges 0.03-0.10%. Over a career, the fee difference alone can cost hundreds of thousands of dollars.[^m5-1]

> **[TIP]** *"I'm [age] and I have [$X] saved for retirement. Am I on track? If not, what's the most impactful thing I can do in the next 12 months?"*

> **[MEME]** The financial services industry has made investing feel like it requires expertise, timing, and sophisticated strategy. For most people it requires three things: an index fund, automatic contributions, and the willingness to not look at it during a market downturn. [Warren Buffett](https://en.wikipedia.org/wiki/Warren_Buffett) bet a hedge fund manager $1 million that a simple S&P 500 index fund would beat a portfolio of hedge funds over ten years. Buffett won.[^m5-2] The most effective investment strategy is also the simplest. That is not a coincidence.

> **[ALSO]** Checking current interest rates, fee schedules, and regulations requires web search, which is free in Gemini, ChatGPT, and Copilot. In Claude, web search requires the paid tier. See [Appendix G](06-appendix-g-feature-table.xhtml).

<!-- RESEARCH NEEDED: Social Security solvency. The SSA trustees report projects the combined trust funds will be depleted around 2034, after which the system can pay approximately 77-80% of promised benefits from ongoing payroll taxes. This is not "Social Security is going bankrupt" — it is a funding gap that Congress can close through multiple mechanisms (raising the cap on taxable earnings, adjusting benefits, changing the retirement age). The anxiety is real but the catastrophizing is overblown. The entry should present the math, not the panic. -->

<!-- RESEARCH NEEDED: Get-rich-quick schemes and investing scams. Crypto pump-and-dumps, forex trading courses, day-trading influencers, multilevel marketing disguised as "financial freedom." The common thread: if someone is selling you a system to get rich, the system is selling the system. Your Agent can evaluate any investment pitch: "Someone is telling me I can make [X] by doing [Y]. Is this legitimate? What are the actual risks they aren't mentioning?" The calibration question (Chapter 4) is designed for exactly this. -->

<!-- RESEARCH NEEDED (HUMAN CONDITION): The anxiety of not having saved enough is one of the most pervasive financial stresses in American life. The median retirement savings for Americans 55-64 is approximately $134,000 (Federal Reserve SCF, 2022). The gap between "what experts say you need" and "what most people have" is large enough to induce paralysis — the person who is behind stops looking because the numbers are too painful. The entry should break through this paralysis: any amount saved now is better than the amount you would have saved if you'd started when the financial advisor said you should have. Perfectionism is the enemy of progress in finance exactly as it is everywhere else. -->

[^m5-1]: S&P Dow Jones Indices. *SPIVA U.S. Scorecard.* Published annually. The 15-year data consistently shows 85-92% of actively managed large-cap funds underperforming the S&P 500.

[^m5-2]: Buffett, W.E. (2017). Berkshire Hathaway Annual Letter to Shareholders. The bet, made in 2007, was against Protégé Partners' selection of hedge funds.

---

#### M-6: Financial Coach
**Strategy:** Decide + Research (Expert Role)
**See also:** Li-9: Making a Household Budget That Holds, M-1: Banking and Savings
**The Majordomo says:** *A fee-only financial advisor charges $200 to $400 per hour and is most useful when you have significant assets to manage. For the financial questions that most people actually have — is this debt worth paying off early, should I keep this money in a savings account or somewhere else, does this insurance make sense, am I being ripped off — your Agent covers the ground at no cost. The key phrase is "fee-only": an advisor who earns commissions on the products they recommend has a structural conflict of interest that no amount of good faith can eliminate.*
**The spec:**
```
Act as a fee-only financial coach with no products to sell.
My situation: [brief description of income, debts, savings, goals]
My question: [specific financial decision or question]
My concern: [what you're worried about getting wrong]
Please give me the honest analysis, including what you'd
want to know more about before giving a final recommendation.
```
**What to do with the output:** For any financial decision over $1,000, ask the calibration question: *"How confident are you in this recommendation, and what should I verify with a professional?"* Your Agent is good at explaining options and running numbers. It is not a fiduciary — it has no legal obligation to act in your interest. A fee-only CFP (Certified Financial Planner) does. For complex situations — estate planning, tax optimization, business finances — the cost of a professional consultation is almost always worth it.

**Common financial Expert Role specs:**
```
Act as a tax advisor. I [got married / had a kid / bought a house /
started freelancing / got an inheritance]. What changes about
my tax situation, and what should I do before the end of the year?
```
```
Act as an insurance advisor with no commission. I'm paying [amount]
for [type of insurance]. Is this a good deal? What coverage do I
actually need vs. what I'm paying for? Am I over- or under-insured?
```
```
Act as a financial coach. Someone is offering me [investment /
business opportunity / loan / deal]. Walk me through the red flags
and the legitimate questions I should ask before committing any money.
```

> **[TIP]** The single highest-leverage financial question: *"I have [$X] that I don't need for 30 days. Where should it be sitting right now to earn interest instead of nothing?"* The answer is almost never "in your checking account."

> **[ALSO]** To make the Financial Coach persistent across sessions, save the Expert Role as a **Project** (Claude), **Gem** (Gemini), or **Custom GPT** (ChatGPT). See [Appendix G](06-appendix-g-feature-table.xhtml).