import puppeteer from 'puppeteer';
import { JSDOM } from 'jsdom';

export interface GoFundMeDonation {
    name: string;
    amount: string;
    time: string;
}

export class GoFundMeCampaign {
    private campaignUrl: string = "";

    constructor(campaignUrl: string) {
        this.campaignUrl = campaignUrl;
    }

    private async getPageContent(url: string): Promise<string> {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        try {
            await page.goto(url);
            const content = await page.content();
            return content;
        } finally {
            await browser.close();
        }
    }

    async getLatestDonations(): Promise<GoFundMeDonation[]> {
        if (this.campaignUrl == "") {
            throw new Error("Campaign URL is not set.");
        }

        const url = `https://www.gofundme.com/mvc.php?route=donate/pagingDonationsFoundation&url=${this.campaignUrl}&idx=0&type=recent`;

        const content = await this.getPageContent(url);
        const page = new JSDOM(content);
        const document = page.window.document;
        const listInfoNodes = document.querySelectorAll(".supporters-list .supporter-info");
        const info: GoFundMeDonation[] = [];

        listInfoNodes.forEach((node) => {
            if(!node) {
                return;
            }

            info.push({
                name: node.querySelector(".supporter-name")?.textContent || "",
                amount: node.querySelector(".supporter-amount")?.textContent || "",
                time: node.querySelector(".supporter-time")?.textContent || "",
            });
        });

        return info;
    }

    async getCampaignTitle(): Promise<string> {
        const url = `https://www.gofundme.com/${this.campaignUrl}`;
        const content = await this.getPageContent(url);
        const page = new JSDOM(content);
        const document = page.window.document;
        const titleNode = document.querySelector("h1.campaign-title");
        return titleNode?.textContent || "";
    }
}